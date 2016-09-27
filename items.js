/*
  Copyright (c) 2008 - 2016 MongoDB, Inc. <http://mongodb.com>

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/


var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');


function ItemDAO(database) {
    "use strict";

    this.db = database;

    this.getCategories = function(callback) {
      "use strict";

			var categories = [];

			this.db.collection('item').aggregate([
				{$match: {"category": {$ne: null}}},
				{$group: {_id: "$category", num: {$sum: 1}}},
				{$sort: {_id: 1}}
			]).toArray(function(err, results){
				var sum = 0;
				results.forEach(function(e, i, a){
					categories.push(e);
					sum += e.num;
				});

				var category = {
            _id: "All",
            num: sum
        };
        categories.push(category)
        callback(categories);
			});
    }


    this.getItems = function(category, page, itemsPerPage, callback) {
      "use strict";
			var query;

			if(category === 'All'){
				query = [
					{$sort: {"_id": 1}},
	 			    {$skip: page * itemsPerPage},
	 			    {$limit: itemsPerPage}
				];
			} else {
				query = [
					{$match: {"category": category}},
 			    {$sort: {"_id": 1}},
 			    {$skip: page * itemsPerPage},
 			    {$limit: itemsPerPage}
				];
			}

			var pageItems = [];
			this.db.collection('item').aggregate(query).toArray(function(err, results){
				results.forEach(function(e, i, a){
					pageItems.push(e);
				});

				callback(pageItems);
			});
    }

    this.getNumItems = function(category, callback) {
      "use strict";

      var numItems = 0;

			if(category === 'All'){
				this.db.collection('item').count(function(error, count){
					callback(count);
				})
			} else {
				this.db.collection('item').aggregate([
					{$match: {"category": category}},
 					{$group: {_id: "$category", num: {$sum: 1}}}
 				]).toArray(function(err, results){
 					results.forEach(function(e, i, a){
						numItems = e.num;
					});
 	        callback(numItems);
 				});
			}
    }

    this.searchItems = function(query, page, itemsPerPage, callback) {
      "use strict";

			var items = [];

			this.db.collection('item').aggregate([
				{$match: {$text: {$search: query}}},
				{$sort: {"_id": 1}},
				{$skip: page * itemsPerPage},
				{$limit: itemsPerPage}
			]).toArray(function(err, resulsts){
				resulsts.forEach(function(e, i, a){
					console.log(e);
					items.push(e);
				})

				callback(items);
			});
    }

    this.getNumSearchItems = function(query, callback) {
      "use strict";

      var numItems = 0;

			this.db.collection('item').find({$text: {$search: query}})
				.count(function(err, count){
					callback(count);
				})
    }


    this.getItem = function(itemId, callback) {
        "use strict";

        /*
         * TODO-lab3
         *
         * LAB #3: Implement the getItem() method.
         *
         * Using the itemId parameter, query the "item" collection by
         * _id and pass the matching item to the callback function.
         *
         */

        var item = this.createDummyItem();

        // TODO-lab3 Replace all code above (in this method).

        // TODO Include the following line in the appropriate
        // place within your code to pass the matching item
        // to the callback.
        callback(item);
    }


    this.getRelatedItems = function(callback) {
        "use strict";

        this.db.collection("item").find({})
            .limit(4)
            .toArray(function(err, relatedItems) {
                assert.equal(null, err);
                callback(relatedItems);
            });
    };


    this.addReview = function(itemId, comment, name, stars, callback) {
        "use strict";

        /*
         * TODO-lab4
         *
         * LAB #4: Implement addReview().
         *
         * Using the itemId parameter, update the appropriate document in the
         * "item" collection with a new review. Reviews are stored as an
         * array value for the key "reviews". Each review has the fields:
         * "name", "comment", "stars", and "date".
         *
         */

        var reviewDoc = {
            name: name,
            comment: comment,
            stars: stars,
            date: Date.now()
        }

        // TODO replace the following two lines with your code that will
        // update the document with a new review.
        var doc = this.createDummyItem();
        doc.reviews = [reviewDoc];

        // TODO Include the following line in the appropriate
        // place within your code to pass the updated doc to the
        // callback.
        callback(doc);
    }


    this.createDummyItem = function() {
        "use strict";

        var item = {
            _id: 1,
            title: "Gray Hooded Sweatshirt",
            description: "The top hooded sweatshirt we offer",
            slogan: "Made of 100% cotton",
            stars: 0,
            category: "Apparel",
            img_url: "/img/products/hoodie.jpg",
            price: 29.99,
            reviews: []
        };

        return item;
    }
}


module.exports.ItemDAO = ItemDAO;
