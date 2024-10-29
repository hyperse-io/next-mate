declare type PageProps<Param = object> = {
  params: Promise<{ locale: string } & Param>;
  searchParams: { [key: string]: string | string[] | undefined };
};

// For CSS
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}
