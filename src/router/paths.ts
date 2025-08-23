const paths = {
  root: "/",
  groups: {
    root: "/groups",
    details: (id: string) => "/groups/" + id,
  },
  commands: "/commands",
  schedules: "/schedules",
  logs: "/logs",
};

export default paths;
