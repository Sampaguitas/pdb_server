![alt text](https://vanleeuwenpublic.s3.eu-west-3.amazonaws.com/proposal/pdb.svg "Project Database (PDB)")

## About:

This is the back end of the Project Database (PDB), the front end of this app can be accessed via the following link: [https://github.com/Sampaguitas/pdb_client](https://github.com/Sampaguitas/pdb_client).

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You will need to install [nodejs](https://nodejs.org/en/) and [gitbash](https://git-scm.com/downloads) (to execute git commands if you are running on windows).

Our database will be hosted on [mLab](https://mlab.com/) and our git repository deployed on [heroku](https://dashboard.heroku.com/). the documents (report templates and material test certificates) will be stored in [aws S3](https://aws.amazon.com/s3/?nc2=h_ql_prod_fs_s3); sign up to all of these platforms if you do not already have an account...

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

In mLabs, click on the Tools tab, copy the mongorestore command line and execute it in gitbash(windows)/ your terminal(linux):

replace "user", "password" with the credentials created above, and "input db directory" with the name of the folder you downloaded above, then click enter... Make sure that you are in the correct directory while executing the command (else navigate to it using CD "change directory").

![alt text](https://vanleeuwenpublic.s3.eu-west-3.amazonaws.com/setup/mongorestore2.png "mongorestore")

If everithing whent well, you should see the following logs in your terminal during the upload:

![alt text](https://vanleeuwenpublic.s3.eu-west-3.amazonaws.com/setup/import+logs.png "import logs")

### Set up the Back End

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
create a **keys_dev.js** file in **pdb_server/config/**, insert the object below:

This file has been added to .gitignore file and will not be visible github when you push your commits.

It contains all your private keys (and should not be visible to the public), we will add these keys in Heroku in the next steps.

```
module.exports = {
    //mlabs
    mongoURI: '',
    secret: '',
    //AWS S3
    accessKeyId: '',
    secretAccessKey: '',
    region: '',
    awsBucketName: '',
    //mail provider
    mailerHost: '',
    mailerPort: '',
    mailerAuthUser: '',
    mailerAuthPass: '',
    //mail signature
    myName: '',
    myPosition: '',
    myPhone: ''
};
```

1. the "mongoURI" can be found in your mLab deployment,
2. Insert a random string for the secret, it will be used to hash passwords and generate Json Web Tokens,
3. The accessKeyId, secretAccessKey, region will be provided while setting up your AWS S3 bucket,
4. create a new bucket in AWS S3, and provide your awsBucketName in the keys_dev.js file.
5. mailerHost, mailerPort, mailerAuthUser and mailerAuthPass (see [nodemailer](https://nodemailer.com/about/)).
6. myName, myPosition, myPhone will be used in your email signature (while sending reset password links to users).

Run the app:

```
$ nodemon start
```
If everithing whent well, you should see below log in your terminal:

![alt text](https://vanleeuwenpublic.s3.eu-west-3.amazonaws.com/setup/nodemon.png "nodemon")

now clear the git info with the following command:

```
git init
```

And push your application to a new Git repo... 

## Deployment

Sign in to your Heroku account and create a new pipeline (that will host both our back_end front_end appliction):

![alt text](https://vanleeuwenpublic.s3.eu-west-3.amazonaws.com/setup/pipeline.png "pipeline")

Then in your pipline create a two new apps under staging (one for the back_end, one for the front_end):

![alt text](https://vanleeuwenpublic.s3.eu-west-3.amazonaws.com/setup/staging.png "staging")

Click on your back_end application and under the deploy tab, click on use github (then link it to your git repo):

![alt text](https://vanleeuwenpublic.s3.eu-west-3.amazonaws.com/setup/use+github.png "use github")


<!-- To deploy your Git repository on Heroku, click on the following link and follow the instructions: 

[https://devcenter.heroku.com/articles/git](https://devcenter.heroku.com/articles/git) -->

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
