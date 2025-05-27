export type TCommandGroup = {
  id: string; // uuid
  title: string;
  commands: TCommmand[];
};

export type TCommmand = {
  id: string; // uuid
  label: string;
  cmd: string;
};
