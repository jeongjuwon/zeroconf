### Zeroconf

The simplest way to start graphql with zero configuration on existing database.

Zeroconf supports to generate C.R.U.D API automatically. It has powerful where clauses for query and also has interface which called hook in each C.U.D mutations.

Lets say that we have user table on our database. In this case zeroconf CRUD schema will be generated with its table name.

### Sequelize ORM

The Zeroconf also uses sequelize orm in its core and has operatorAliases for complex where clauses like below. so you can see that query manual for use it.

```
// The default contained operatorsAliases.

const operatorsAliases = {
  $eq: Op.eq,
  $ne: Op.ne,
  $gte: Op.gte,
  $gt: Op.gt,
  $lte: Op.lte,
  $lt: Op.lt,
  $not: Op.not,
  $in: Op.in,
  $notIn: Op.notIn,
  $is: Op.is,
  $like: Op.like,
  $notLike: Op.notLike,
  $iLike: Op.iLike,
  $notILike: Op.notILike,
  $regexp: Op.regexp,
  $notRegexp: Op.notRegexp,
  $iRegexp: Op.iRegexp,
  $notIRegexp: Op.notIRegexp,
  $between: Op.between,
  $notBetween: Op.notBetween,
  $overlap: Op.overlap,
  $contains: Op.contains,
  $contained: Op.contained,
  $adjacent: Op.adjacent,
  $strictLeft: Op.strictLeft,
  $strictRight: Op.strictRight,
  $noExtendRight: Op.noExtendRight,
  $noExtendLeft: Op.noExtendLeft,
  $and: Op.and,
  $or: Op.or,
  $any: Op.any,
  $all: Op.all,
  $values: Op.values,
  $col: Op.col
};
```

As of result, You can query to the graphql server like this.

```
query {
  users(
    where: {
      or: [{ user_id: 1, user_id: 2 }]
    }
  ) {
    user_id
    email
  }
}
```

### Support Generating C.R.U.D API

#### Object generation support:

- The zeroconf will generates object types and mutations, queries over the your table name.

  If you have a table which called **user_lesson**, zeroconf will generate these things.

  - type **UserLesson**
  - Query { **userLesson**, **userLessons**, **numUserLesson** }
  - Subscription { **userLesson**, **userLessons**, **numUserLesson** }
  - Mutation { **createUserLesson**, **updateUserLessons**, **deleteUserLesson** }

#### Query generation support:

- generated singluar name Query field for fetching one row

  **user**(**where**: UserWhereInput!): User

- generated plural name Query field for fetching all row on some query condition:

  **users**(**limit**: Int, **start**: Int, **where**: JSON, **order**: UserOrderInput)

#### Mutation generation support:

- Creation

  **_createUser_**(input: UserCreationInput!): User

- Update:

  **_updateUser_**(where: UserWhereInput!, input: UserUpdateInput!): User

- Delete:

  **_deleteUser_**(input: UserCreationInput!): User

#### Child Relations

If table has the column id and it has foreign key which refers to the other tables.
zeroconf generates sub-fields for graph query.

```
# The bond table
bond
| id
| contract_num
| loan_request_id -> foreign key refers to the loan_request table
| ....more

# The loan_request table
loan_request
| id -> referred from foreign key bond.loan_request_id of bond table
| user_id
| ....more

# Since bond table has a foreign key loan_request_id which refers to the loan_request table, loanRequest and loanRequests will be generated.

type Bond {
  id
  -> loanRequest # generated by checking foreign key
  -> loanRequests # generated by checking foreign key
}

# So you can query like below.

query {
  bonds {
    id
    contract_num
    loanRequest {
      user_id
    }
  	loanRequests {
      user_id
    }
  }
}

# And you can see the result of a query like below.
{
  "data": {
    "bonds": [
      {
        "id": "246",
        "contract_num": "0000246-20181116",
        "loanRequest": {
          "user_id": 4897
        },
        "loanRequests": [
          {
            "user_id": 4897
          }
        ]
      },
      {
        "id": "247",
        "contract_num": "0000247-20181126",
        "loanRequest": null,
        "loanRequests": []
      },
      ...more
    ]
  }
}
```

### Installation

```
git clone https://github.com/graphql-zeroconf/zeroconf_template.git
npm install
```

Create your .env file. Here is the example for each databases. Zeroconf contains sequelize in it so we can use the databases that MySQL, MariaDB, Postgres, SQLite And MSSQL.

MySQL, MariaDB

```
.env

MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=db
MYSQL_USER=user
MYSQL_PASSWORD=pwd
```

Postgres

```
.env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DATABASE=db
POSTGRES_USER=user
POSTGRES_PASSWORD=pwd
```

SQLite

```
.env
SQLITE_HOST=localhost
SQLITE_DATABASE=main
SQLITE_USER=
SQLITE_PASSWORD=
SQLITE_STORAGE=./sqlite/chinook.db
```

Other options

As we mentioned before that zeroconf contains node sequelize. You can use other options for sequelize to initialize. After clone the repository zeroconf_template and open the file `.sequelize.cfg.js`. Edit options and add more you needed. If you want to know more options on sequelize, please refer to the link below to set up other options.

Sequlize Doc: [https://sequelize.readthedocs.io/en/1.7.0/docs/usage/](https://sequelize.readthedocs.io/en/1.7.0/docs/usage/)

```javascript
const path = require("path");
require("dotenv").config({ debug: process.env.DEBUG });

module.exports = {
  database: process.env.SQLITE_DATABASE,
  user: process.env.SQLITE_USER,
  password: process.env.SQLITE_PASSWORD,
  option: {
    storage: process.env.SQLITE_STORAGE,
    host: process.env.SQLITE_HOST,
    dialect: "sqlite",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    additional: {
      timestamps: false
      // createdAt: 'cdate',
      // updatedAt: 'udate',
    }
  }
};
```

Generate models

```
$ node scripts/gen_model
```

Just Start

```
$ npm start
```
