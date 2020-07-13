![alt text](https://vanleeuwenpublic.s3.eu-west-3.amazonaws.com/proposal/pdb.svg "Project Database (PDB)")

## About:

This is the back end of the Project Database (PDB), the front end of this app can be accessed via the following link: [https://github.com/Sampaguitas/pdb_client](https://github.com/Sampaguitas/pdb_client).

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You will need to install [nodejs](https://nodejs.org/en/) and [gitbash](https://git-scm.com/downloads) (to execute git commands if you are running on windows).

Our database will be hosted on [mLab](https://mlab.com/) and our git repository deployed on [heroku](https://dashboard.heroku.com/); sign up to both of these websites if you do not already have an account...

### Set up the Database

click on the following link to download an empty copy of the database: (link to be provided).

This database contains the minimum information required to get you up and running.

#### 1. Create a new deployement

Login to your mLab account and click on "create new"

![alt text](https://vanleeuwenpublic.s3.eu-west-3.amazonaws.com/setup/new+deployement.png "create new deployment")

#### 2. Select your Cloud provider, Plan type and Region:

We recomend using the free SANDBOX Plan from Amazon Web Services, choose the nearest location.

![alt text](https://vanleeuwenpublic.s3.eu-west-3.amazonaws.com/setup/select+could+provider.png "select cloud provider")

#### 3. Add a new database user

Click on the Users tab and click on "Add database user".

Use different credentials than your mlab account; these credentials will be used to execute the Git command below.

![alt text](https://vanleeuwenpublic.s3.eu-west-3.amazonaws.com/setup/add+new+user.png "add new user")

#### 4. Import Database (Binary)

In gitbash(windows)/ your terminal(linux), navigate to the directory where the database has bin downloaded.

In mLabs, click on the Tools tab, copy the mongorestore command line and execute it in gitbash(windows)/ your terminal(linux):

replace "user", "password" with the credentials created above, and "input db directory" with the folder name and click enter.

![alt text](https://vanleeuwenpublic.s3.eu-west-3.amazonaws.com/setup/mongorestore.png "mongorestore")

You should see the following logs in your terminal during the upload if everithing whent well:

![alt text](https://vanleeuwenpublic.s3.eu-west-3.amazonaws.com/setup/import+logs.png "import logs")

### Installing the Back End

Clone this repository:

```
$ git clone https://github.com/Sampaguitas/pdb_server.git
```

Install nodemon globally (to reload the application on file change):

```
npm i -g nodemon
```

Install all other dependencies:

```
$ npm install
```

Run the app:

```
$ nodemon start
```

## Deployment

To deploy your Git repository on Heroku, click on the following link and follow the instructions: 

[https://devcenter.heroku.com/articles/git](https://devcenter.heroku.com/articles/git)

## Built With

* [mongoose](https://mongoosejs.com/) - The database
* [node.js](https://nodejs.org/en/) - JavaScript runtime
* [npm](https://www.npmjs.com) - Dependency Management
* [express](http://expressjs.com/) - The framework

This application contains 416 files and 33,442 lines of code.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for details about our code of conduct and how to submit pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/Sampaguitas/pdb_client/tags). 

## Authors

**Timothee Desurmont** - *Business Development Manager* - [View profile](https://www.linkedin.com/in/timothee-desurmont-82243245/)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
