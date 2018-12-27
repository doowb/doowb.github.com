---
title: Realtime Angular.js with Pusher
date: "2014-01-30 10:00:00"
---

There has been a lot of hype around using [Firebase](https://www.firebase.com/) and [Angular.js](http://angularjs.org/) to create realtime applications. These applications are great at keeping the application's state in sync between clients and providing a full realtime document database simliar to [MongoDB](http://www.mongodb.org/) and [CouchDB](http://couchdb.apache.org/). What if you already have an Angular.js application, your data is already stored in MongoDB, and you just want to notify connected clients that something on the server has changed? This is where [Pusher](http://pusher.com/) and [angular-pusher](https://github.com/doowb/angular-pusher) come into play.

### Angular.js

Angular.js is a client side JavaScript framework built by Google. It provides the framework for building either small components that can be plugged in to your website or entire single page applications. At the core of Angular.js is a module system that allows creating providers, services, factories, and directives. All of these are used within controllers to create, retrieve, update, and delete data while providing nice features for manipulating the HTML DOM with little custom JavaScript code.

In a simple Angular.js application, data is retrieved and sent to and from a backend server through an `$http` or `$resource` service provided by the framework. Below is an example of retrieving a list of items from an API and updating the selected item using the `$http` service.

```js
var ItemListController = function ($scope, $http) {
  // initialize a list of items on the scope
  $scope.items = [];

  var retrieveItems = function () {
    // get a list of items from the api located at '/api/items'
    $http.get('/api/items')
    	.success(function (items) {
	      $scope.items = items;
	    });
  };

  $scope.updateItem = function (item) {
    $http.post('/api/items', item);
  };

  // load the items
  retrieveItems();
};
```

```html
<div ng-controller='ItemListController'>
	<h1>Items</h1>
	<table>
	  <tr><th>Name</th><th>Qty</th><th></th></tr>
	  <tr ng-repeat="item in items">
	    <td><input type="text" ng-model="item.name"></td>
	    <td><input type="text" ng-model="item.qty"></td>
	    <td><button type="button" ng-click="updateItem(item)">Update</button></td>
	  </tr>
	</table>
</div>
```

If we needed to know when items have been updated on the server by another user, we would have to constantly poll the server to find out if the `items` array changed.

```javascript
var ItemListController = function ($scope, $http, $timeout) {

  $scope.items = [];

  var retrieveItems = function () {
    // get a list of items from the api located at '/api/items'
    $http.get('/api/items')
    	.success(function (items) {
	      $scope.items = items;

	      // check for item changes
	      $timeout(retrieveItems, 5000);
	    });
  };

  ...
};
```

As you can see, we just update the `items` array every five seconds which isn't something that we want to keep doing. If a user is making a lot of changes, then we don't want to keep overwriting the `items` array. You could build the logic to only update changed items, but you still have the issue of polling the server every five seconds. It would be much nicer if we could subscribe to an event and wait for a notification of changes in realtime.

### Making Angular.js realtime with Pusher

Using Pusher will allow us to subscribe to events triggered by other clients. First I'll show you the simple changes needed in our `ItemLIstController` to use angular-pusher. Then I'll show you an example of using Pusher in a Node.js server when an item is updated.

First, we need tell our Angular.js application to use angular-pusher. You can do this by either downloading the [development](https://github.com/doowb/angular-pusher/blob/master/angular-pusher.js) or [production](https://github.com/doowb/angular-pusher/blob/master/angular-pusher.min.js) files from [GitHub](https://github.com/doowb/angular-pusher/blob/master) or using `bower install angular-pusher` and loading them into your page with the following script tag:

```html
<script type="text/javascript" src="bower_components/angular-pusher/angular-pusher.min.js"></script>
```

This should be loaded after the `angular.min.js` file and before your `application.js` script.

Now we can tell our application that we want to use the services provided in `angular-pusher.min.js`.

```javascript
angular.module('myApp', ['doowb.angular-pusher']).

config(['PusherServiceProvider',
	function(PusherServiceProvider) {
		PusherServiceProvider
			.setToken('d420162e600c57b0e60f')
			.setOptions({});
	}
]);
```

The angular-pusher module has a `PusherServiceProvider` that can be configured when creating your application. Here is where you can set your Pusher application key (`PusherServiceProvider.setToken('token')`), additional Pusher options (`PusherServiceProvider.setOptions(options)`), and a specific version of Pusher (`PusherServiceProvider.setPusherUrl(url)`). The Pusher url has a default, but it may be an older version.

Now we can use Pusher in our controller to subscribe to events and be notified when our `items` array changes:

```javascript
var ItemListController = function($scope, $http, Pusher) {
	$scope.items = [];

	Pusher.subscribe('items', 'updated', function (item) {
    // an item was updated. find it in our list and update it.
		for (var i = 0; i < $scope.items.length; i++) {
			if ($scope.items[i].id === item.id) {
				$scope.items[i] = item;
				break;
			}
		}
	});

  var retrieveItems = function () {
    // get a list of items from the api located at '/api/items'
    console.log('getting items');
    $http.get('/api/items')
    	.success(function (items) {
	      $scope.items = items;
      });
  };

  $scope.updateItem = function (item) {
  	console.log('updating item');
    $http.post('/api/items', item);
  };

  // load the items
  retrieveItems();
}
```

In the Node.js server, we setup our connection to Pusher with a few lines of code. It only takes one more line of code to trigger the actual update notification:

```javascript
// setup Pusher
var Pusher = require('pusher');
var pusher = new Pusher({
  appId: '12345',
  key: 'some key',
  secret: 'my secret... shhh!!!'
});

// in our express server
// setup a post route and trigger the change in Pusher
app.post('/api/items', function (req, res) {

  // get our item from the req and update the item collection
  // in a production application this would have validation and items
  // would be stored in a database.
  var item = req.body;
  items[item.id] = item;

  // tell Pusher to trigger an 'updated' event on the 'items' channel
  // add pass the changed item to the event
  pusher.trigger('items', 'updated', item);

  // respond with the changed item
  res.json(item);
});

```

### Get Pushing

All of this code can be found [here on GitHub](https://github.com/doowb/angular-pusher). The [`gh-pages` branch](https://github.com/doowb/angular-pusher/tree/gh-pages) contains the examples that these code snippets came from. The application itself can be [found here](http://doowb.github.io/angular-pusher), but the server side examples won't work when hosted on [GitHub Pages](http://pages.github.com/).

Hopefully this article and the code samples are enough to get your Angular.js application working with Pusher.
