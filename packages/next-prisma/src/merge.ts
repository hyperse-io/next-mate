import * as glob from 'glob';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { promisify } from 'node:util';
import {
  type DataSource,
  type DMMF,
  type GeneratorConfig,
} from '@prisma/generator-helper';
import getPrismaConfig from '@prisma/internals';
import {
  deserializeDatasources,
  deserializeEnums,
  deserializeGenerators,
  deserializeModels,
} from './deserializer.js';
import {
  type CustomAttributes,
  type Field,
  type Model,
  type WritableDeep,
} from './dmmf-extendsion.js';

const { getDMMF, getConfig } = getPrismaConfig;

export interface prismaMergeOptions {
  input: string[];
  output?: string;
  luciaPrismaModel?: string;
}

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

type UnPromisify<T> = T extends Promise<infer U> ? U : T;

type Schema = NonNullable<UnPromisify<ReturnType<typeof getSchema>>>;

async function getSchema(schemaString: string, schemaPath: string) {
  try {
    // read model config
    const dmmf = await getDMMF({ datamodel: schemaString });
    const customAttributes = getCustomAttributes(schemaString);
    const models: Model[] = dmmf.datamodel.models.map((model: any) => ({
      ...model,
      doubleAtIndexes: customAttributes[model.name]?.doubleAtIndexes,
      fields: model.fields.map((field: any) =>
        // Inject columnName and db.Type from the parsed fieldMappings above
        {
          const attributes =
            customAttributes[model.name]?.fields[field.name] ?? {};

          return {
            ...field,
            columnName: attributes.columnName,
            dbType: attributes.dbType,
            relationOnUpdate: attributes.relationOnUpdate,
          };
        }
      ),
    }));

    // if it is local lucia.prisma, don't set datasources and generators
    if (schemaPath === 'luciaPrisma') {
      return {
        models,
        enums: dmmf.datamodel.enums,
        datasources: [],
        generators: [],
      };
    }

    // read datasource and generator config
    const config = await getConfig({ datamodel: schemaString });
    return {
      models,
      enums: dmmf.datamodel.enums,
      datasources: config.datasources,
      generators: config.generators,
    };
  } catch (e) {
    console.error(
      `prismaMerge failed to parse schema located at "${schemaPath}". Did you attempt to reference to a model without creating an alias? Remember you must define a "blank" alias model with only the "@id" field in your extended schemas otherwise we can't parse your schema.`,
      e
    );
    return undefined;
  }
}

function getCustomAttributes(datamodel: string) {
  const modelChunks = datamodel.split('\n}');
  return modelChunks.reduce(
    (
      modelDefinitions: Record<string, CustomAttributes>,
      modelChunk: string
    ) => {
      // Split the model chunk by line to get the individual fields
      const pieces = modelChunk
        .split('\n')
        .filter((chunk) => chunk.trim().length);
      // Pull out model name
      const modelName = pieces
        .find((name) => name.match(/model (.*) \{/))
        ?.split(' ')[1];
      if (!modelName) return modelDefinitions;
      // Regex for getting our @map attribute
      const mapRegex = new RegExp(/[^@]@map\("(?<name>.*)"\)/);
      const dbRegex = new RegExp(/(?<type>@db\.(.[^\s@]*))/);
      const relationOnUpdateRegex = new RegExp(
        /onUpdate: (?<op>Cascade|NoAction|Restrict|SetDefault|SetNull)/
      );
      const doubleAtIndexRegex = new RegExp(/(?<index>@@index\(.*\))/);
      const doubleAtIndexes = pieces
        .reduce((ac: string[], field) => {
          const item = field.match(doubleAtIndexRegex)?.groups?.index;
          return item ? [...ac, item] : ac;
        }, [])
        .filter((f) => f);
      const fieldsWithCustomAttributes = pieces
        .map((field) => {
          const columnName = field.match(mapRegex)?.groups?.name;
          const dbType = field.match(dbRegex)?.groups?.type;
          const relationOnUpdate = field.match(relationOnUpdateRegex)?.groups
            ?.op;
          return [
            field.trim().split(' ')[0],
            { columnName, dbType, relationOnUpdate },
          ] as [string, CustomAttributes['fields'][0]];
        })
        .filter(
          (f) => f[1]?.columnName || f[1]?.dbType || f[1]?.relationOnUpdate
        );

      return {
        ...modelDefinitions,
        [modelName]: {
          fields: Object.fromEntries(fieldsWithCustomAttributes),
          doubleAtIndexes,
        },
      };
    },
    {}
  );
}

function mixModels(inputModels: Model[]) {
  const models: Record<string, Model> = {};
  for (const inputModel of inputModels) {
    const existingModel: Model | undefined = models[inputModel.name];

    // if the model already exists in our found models, merge the fields
    if (existingModel) {
      const existingFieldNames = existingModel.fields.map((f) => f.name);
      for (const field of inputModel.fields) {
        // if this field exists in the existing model
        if (existingFieldNames.includes(field.name)) {
          const existingFieldIndex: number = existingFieldNames.indexOf(
            field.name
          );

          // assign columnName (@map) based on existing field if found
          const existingField: Field | undefined =
            existingModel.fields[existingFieldIndex];
          if (!field.columnName && existingField?.columnName) {
            field.columnName = existingField.columnName;
          }

          // replace the field at this index with the new one
          existingModel.fields[existingFieldIndex] = field;
        } else {
          // if it doesn't already exist, append to field list
          existingModel.fields.push(field);
        }
      }

      // assign dbName (@@map) based on new model if found
      if (!existingModel.dbName && inputModel.dbName) {
        existingModel.dbName = inputModel.dbName;
      }

      // merge doubleAtIndexes (@@index) based on new model if found
      if (inputModel.doubleAtIndexes?.length) {
        existingModel.doubleAtIndexes = [
          ...(existingModel.doubleAtIndexes ?? []),
          ...inputModel.doubleAtIndexes,
        ];
      }

      // merge unique indexes (@@unique) based on new model if found
      if (inputModel.uniqueIndexes?.length) {
        existingModel.uniqueIndexes = [
          ...(existingModel.uniqueIndexes ?? []),
          ...inputModel.uniqueIndexes,
        ];

        existingModel.uniqueFields = [
          ...(existingModel.uniqueFields ?? []),
          ...inputModel.uniqueFields,
        ];
      }
    } else {
      models[inputModel.name] = inputModel;
    }
  }

  return Object.values(models);
}

export async function prismaMerge(options: prismaMergeOptions) {
  const {
    input: inputs,
    output = 'prisma/schema.prisma',
    luciaPrismaModel = '',
  } = options;
  const schemasToMix: Schema[] = [];

  // load the schema data for all inputs
  for (const input of inputs) {
    for (const file of glob.sync(input)) {
      const filePath = path.join(process.cwd(), file);
      const schemaString = await readFile(filePath, {
        encoding: 'utf-8',
      });
      const parsedSchema = await getSchema(schemaString, filePath);
      if (parsedSchema) schemasToMix.push(parsedSchema);
    }
  }

  // load the schema data for the lucia.prisma to cover all models
  if (luciaPrismaModel) {
    const luciaSchema = await getSchema(luciaPrismaModel, 'luciaPrisma');
    if (luciaSchema) schemasToMix.push(luciaSchema);
  }

  // extract all models and mix
  let models: Model[] = [];
  for (const schema of schemasToMix) {
    models = [...models, ...schema.models];
  }
  models = mixModels(models);

  let enums: WritableDeep<DMMF.DatamodelEnum>[] = [];
  schemasToMix.forEach(
    (schema) => !!schema.enums && (enums = [...enums, ...schema.enums] as any)
  );

  // use the last found datasources
  let datasources: DataSource[] = [];
  schemasToMix.forEach((schema) => {
    if (
      schema.datasources.length > 0 &&
      schema.datasources.filter((d: any) => d?.url?.value).length > 0
    ) {
      datasources = schema.datasources;
    }
  });

  // use the last found generators
  let generators: GeneratorConfig[] = [];
  schemasToMix.forEach((schema) => {
    if (schema.generators.length > 0) {
      generators = schema.generators;
    }
  });

  const outputSchema = [
    '// *** GENERATED BY next-prisma :: DO NOT EDIT ***',
    await deserializeDatasources(datasources),
    await deserializeGenerators(generators),
    await deserializeModels(models),
    await deserializeEnums(enums),
  ]
    .filter((e) => e)
    .join('\n');

  await writeFile(path.join(process.cwd(), output), outputSchema);
}
