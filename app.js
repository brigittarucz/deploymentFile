const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// ARANGO DB

const arangojs = require('arangojs');
const dbConfig = {
	host: 'localhost',
	port: '8529',
	username: 'root',
	password: '',
	database: '_system',
};

const dbArango = new arangojs.Database({
	url: `http://${dbConfig.host}:${dbConfig.port}`,
	databaseName: dbConfig.database
});

dbArango.useBasicAuth(dbConfig.username, dbConfig.password);

// MARIA DB

const mysql = require('mysql2');

const pool = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'sandbox',
    password: '',
    port: 3306
});

const dbMaria = pool.promise();

app.use(bodyParser.urlencoded({extended: false}));

const connection = dbArango.query('FOR status IN sandbox_arango RETURN status').then(value => {
    return value.all();
})

connection.then(statusArango => {
    const connection_2 = dbMaria.execute('SELECT * FROM sandbox_test').then(statusMaria => {
        console.log('Arango:' + statusArango[0]["status"] + ' Maria:' + statusMaria[0][0].status);
        app.use('/', (req,res,next) => {
            res.writeHead(200, {'Content-Type': 'text/html'}); 
            res.write('Hey from the node app');
            res.end();
        });
    }).catch(error => {
        console.log(new Error(error));
    })
}).catch(error => {
    console.log(new Error(error));
})

app.listen(3000);

 