var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

//MongoDB Connection information
var url = require('url');

var settings=require('../config/config.js');  //change monogodb server location here
var db; 


/* GET home page. */
router.get('/', function(req, res, next) {
    //If they jumped directly to a route and don't have a sessionID redirect them
    if (!req.session.sessionID) 
    {
        res.redirect('/');
        res.end();
        return;
    }
    res.render('joins', { title: 'MongoDB - General purpose database for GIANT IDEAS' });
     
});

router.post('/', function (req,res, next){

    var ResultSet=[];

    var CitySearchCriteria=req.body.City;
    var StateSearchCriteria=req.body.State;

    MongoClient.connect(settings.connectionString, function(err, client) {

        assert.equal(null, err);
        if(err) throw err;

        db = client.db(settings.database);
    
        var JoinSearchResults = db.collection('business').aggregate(
            [
                {
                    '$match' : {
                        'state' : StateSearchCriteria,
                        'city' : CitySearchCriteria,
                        'categories' : {
                            '$in' : [
                                'Pizza'
                            ]
                        }
                    }
                },
                {
                    '$sort' : {
                        'stars' : 1
                    }
                },
                {
                    '$limit' : 5
                },
                {
                    '$lookup' : {
                        'from' : 'reviews',
                        'localField' : 'business_id',
                        'foreignField' : 'business_id',
                        'as' : 'reviews'
                    }
                },
                {
                    '$project' : {
                        'name' : 1,
                        'full_address' : 1,
                        'stars' : 1,
                        'reviews.text' : 1
                    }
                }
            ]).toArray().then(function (items) {

      

            items.forEach((item, idx, array) =>
            {
                // console.log(idx + " " + item);
                ResultSet.push({ item } ); /*
                ResultSet.push({
                        BusinessName: item['name'],
                        FullAddress: item['full_address'],
                        Stars: item['stars'],
                        ReviewText: item['reviews.text']*/
                //});

            });

            res.send(ResultSet); // sendStatus(201);
            res.end();
            client.close();
        })
            .catch(function(e) {
                console.log(e);
                res.status(500).send(e);
            });
    });
});


module.exports = router;