use rusqlite_migration::{Migrations, M};

pub fn migrations() -> Migrations<'static> {
    Migrations::new(vec![
        M::up(include_str!("sql/v1__initial.sql")),
        M::up(include_str!("sql/v2__add_command_icon.sql")),
        M::up(include_str!("sql/v3__add_group_icon.sql")),
    ])
}
