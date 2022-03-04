# What Be This?

A super basic monilith that "handles" users, accounts and transactions.

The times you'll have palying this will be the things your ancestors absolutely do not sing about.

Concurrency is handled by way of lock tokens, and using idempotency keys. This prevents things like duplicate debit/credit and would prevent someone closing an account before a debit comes out.

While I support the ability to create multiple accounts for users, I did not create a list accounts route, to save time.

Because of time constraints, some "corners" were cut, but mostly explained below. I'm sure I missed explaining one in this novel.

Unit tests are providing reasoanble coverage, but missing full integration tests that could/would be handled by fully implemented postman tests. Dependenccy injection is applied to controllers, because I'm not a monster.

I skipped testing lock and unlock because.....they worked on my machine. But seriously, I would in real situation. I would also go for 100% coverage, cuz dats how I roll!

## Things you can do

**SEE ROUTES BELOW FOR MORE USEFUL INFO**

Create a user profile account.

Create an account (da kind fo' da chedda') for a user. It will really tie the room together.

Create a debit or credit on an account, and make it rain, or reverse rain, or whatever analogy you want to use.

Close an account, because you're breaking up!

### Handling Idempotency

> Idempotency is handled with the following initiatives.

- IdempotencyKey submitted in the header of the request
- Lock token handled before a `transaction` is made

1. First the `acount` resource is locked with using a lock token.
1. The `transaction` is submitted with an idempotencyKey, which for the purpose of this demo, is just a _unique_ UUID, however in a real world implentation, this would be a property of the session table, and could be updated after success. This process is beyond the scope of this API.

```
CLIENT        SERVICE
  | LOCK         |
  | -----------> |
  | 200          |
  | <----------- |
  | LockToken    |
  |              |
  |              |
  | TRANSACTION  |
  | -----------> |
  | with lock    |
  | token and    |
  | idempotentcy |
  | key in header|
  |              |
  | 500 Failure  |
  | <----------- | Failure with retriability can be achieved
  |              |
  | 200 SUCCESS  |
  | <----------- | Successful change to account
  |              |
  | TRANSACTION  |
  | -----------> | In the case of a multiple click,
  |              | the idempotency key will prevent
  |              | duplicate transactions, even if
  |              | the lock is valid. End ressult will
  |  204 SUCCESS | be the same as success, and account
  | <----------- | will be correct.
  |              |
  | UNLOCK       |
  | -----------> |
  | with lock    |
  | token in     |
  | header       |
```

> By enforcing transactions with a lock token AND an idempotency key, the service should be able to enforce idempotency, and ensure better confidence in the changes made by debit and credit calls

## Prerequisites

1. That feeling Rocky has...something about tigers eyes

1. A Computer

1. Some version of Node greater than 10.16.3. I'm using v16.13.2. We live in exciting times.

1. Some version of npm. Less exciting than above. Version 8.1.2.

1. Honestly you should have POSTMAN to run the requests, if you don't, it's fine, we'll all live.

1. The will to continue.

## Operating Instructions

1. Open terminal

1. Go to root of this project

1. In the terminal

   > npm install

1. In the terminal

   > npm run build

1. In the terminal

   > npm run seed

## Testing

### Unit Tests

1. Do the steps in operating instructions.

1. Npm run test.

1. Marvel in wonder at that code coverage. It's like rich Corinthian Leather!

### Personal Tests

I included the setup of Postman tests in a collection in the Tests folder. It's nice.

# API Routes

## What I Did

**ACCOUNT**

1. **_POST_** `/account` -- Create a new account
1. **_POST_** `/account/:id` -- Create a new debit/credit transaction on account
1. **_LOCK_** `/account/:id` -- Lock account for concurrency and idempotency
1. **_UNLOCK_** `/account/:id` -- Release the lock token for an accountId
1. **_GET_** `/account/:id` -- Get account by accountId
1. **_PUT_** `/account/:id/close` -- Close account

**USER**

1. **_POST_** `/user/create` -- Create user profile

## What I would do with more time

1. Use middleware for schema validation
1. Use middleware for session validation
1. Better error messages (they're fine....but definitely not in the parlance of our times)
1. Open API Spec (OAS) documentation for API Schema

# Database Schema

### User

- `id `(Primary Key) autoincrementing integer
- `firstName` string(255)
- `lastName` string(255)
- `userName` string(255)
- `password` string(255) -- Silly on purpose
- `createdAt` DateTime
- `updatedAt` DateTime

### Account

- `id` (Primary Key) autoincrementing integer
- `accoutName` string(255)
- `balance` decicmal
- `closed` nullable DateTime (non null value will act as truthy)
- `createdAt` DateTime
- `updatedAt` DateTime

### Transaction

- `id` (Primary Key) autoincrementing integer
- `accountId` integer
- `userId` integer
- `transactionType` string
- `amount` decicmal
- `idempotencyKey` string
- `createdAt` DateTime
- `updatedAt` DateTime

### Lock

- `id` (Primary Key) autoincrementing integer
- `accountId` integer
- `userId` integer
- `lockToken` string
- `expiry` DateTime
- `idempotencyKey` string
- `createdAt` DateTime
- `updatedAt` DateTime

## Choices Made

1. Used sequelize so you know I can use a ORM (I used it NEWBISH for time's sake), am handling transactions and was going to implement Optimistic locking

1. Since I am not implementing auth, passwords are stored as plain text to get this done quickly and cuz YOLO -- I would ever do this (I hope you believe me)

1. Stuck with DateTime for consistency, and didn't want to go and mess with the built in stuff in Sequeilze. Dates are the bane of my existence. MS from EPOCH or DEATH!

1. Lock table for quasi pessimistic locking (refer to Idempotency section above for further explanation)

1. Currency in standard 2-decimal place...YOLO. I've done both no decimals in cents (gold, myrrh and frankincense -- I also let my backbone slide)

1. No session table to store session details and idempotency key due to time constraints

1. No role based table, so currently only the singular owner of the Account can make changes. Roles, and scopes woudl be part of auth policies and implementation.

1. I ran into a stupid issue with sequelize that I fixed, but in doing so, I moved all the models and what not into a single file. Running out of time, and since it was working and I don't mess with working I left it. There are interfaces and properly formed models that are LIKELY fine, but untested. I trust that you have enough to see there that I had an idea of what I was doing, and would never do this in real life. Ask my mom! Time was the issue.

1. More complete unit testing.

## What I would do with more time or in real world

1. Etag management, certainly on accounts

1. Indexes on searchable properties for faster search

1. Extended user table to accommodate more fields OR better yet link to polymorphic attributes table

1. Not used decimal for financial amounts

1. Not used datetime for storing time, save as ms from epoch (faster indexing, plus no date nonsense)

1. Session table, that will handle login, logout

1. Obfuscated credentials in separate table, with proper hashed result

1. Accommodate for multiple users attached to accounts

1. Sequelize does silly things with table names and column names. I would have configured them to be less foolish. I hate what it did, and I will be speaking to my MPP and/or therapist about it at some point.

1. Not used moment. I like moment. It's deprecated, but it behaves nicely. Yeah it's a hog, but YOLO.

1. More work with UUIDs and UUID management. Had no idea that package was deprecated. Stuck with it anyway. YOLO. Clean code has no warnings no errors. I'm violating my principles. May Dog the Bounty Hunter have mercy on my soles.

# Bonus Points Sections

## Authentication

Authentication would use OAuth 2.0 Principles using Access Tokens in the form of JWTs, Roles (for access control) and Scopes. I would roll a fully mobilized Security library to handle all this, and it could be it's own microservice. All of this is WAY out of scope on an 2-3 hour take home assignment, and we can talk about this stuff more if you want. This is not my speciality, but I've done it before.

## Growth

1. Micro service architecture to reduce bloat, speed up deployments (fewer tests on service) and for

1. Proper auth/security library

1. Multiple instances of service(s) behind F5 Load Balancer

1. Shard the database for data growth and use between instances

1. Distributed Lock Manager system for sharding

1. Much better management of idempotency key

1. Retriablity framework

1. Rate limiting

## Deployment

1. Proper CI/CD pipeline for running tests, on evironments, and deployed to environment individually. Perferably, DEV, QA, STAGING, PROD

1. I didn't do all this becasue of time constraints, but could have deployed to Heroku for giggles, but now....no one's laughing. #sadfrownyface
