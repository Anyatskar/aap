//goals:

//1. fetch data

//2. read data

//3. make Animal objs

//4. display UI



var hits = 0;

//Animal obj
function Animal (id, name, photo, stats, location, breed) {

  //properties
  this.id = id;
  this.name = name;
  this.photo = photo;
  this.stats = stats;
  this.location = location;
  this.breed = breed;
  //other
  this.favourited = false;

  //methods
  //fetch further info 
  this.fetchDetails = function (that) {
    //db data
    //call
    dbUtility("pet_details", "e41b6bf1618d053c31d524d479c14b4y", "&pet_id="+id, function(response, animal) { //args = arg1, arg2, arg3, callback //need keyword this?
        
        //decode and use response
        var dbData = JSON.parse(response).pet;
        //continue adding to Animals (Animal objs)
        
        //add further details to Animal obj
        var dbTrivialData = trivialDetails(dbData);
        animal.adopted = dbTrivialData.adopted;
        animal.act_quickly = dbTrivialData.act_quickly;
        animal.special_needs = dbTrivialData.special_needs;
        animal.bonded_pair = dbTrivialData.bonded_pair;

        animal.size = dbTrivialData.size;
        animal.color = dbTrivialData.color;
        animal.description = recodeText(dbTrivialData.description);
        animal.stats_extra = formatText(dbTrivialData);

        //requests counter
        hits++;
        if(hits == anmlObjs.length) {        	
        	//note: wait until all calls complete (i.e. until each individual pet has been given additional details from db, or else db queries might not have all finished upon page load and we'd be missing data)
        	//TODO: handle case when one ajax call never completes, either with an error or gets stuck for a long time or times out after a long time
        	updateAnmlObjs(anmlObjs);
        }
        
    }, that);
  }(this); //creates and calls fn
  //this.fetchDetails(); //or could call fn immediately after, like this

}


//init
function init () {
    //db data
    //call
    dbUtility("pet_search", "e41b6bf1618d053c31d524d479c14b4y", "&geo_range=1&city_or_zip=San%20Francisco,%20CA&species=dog", function(response) { //args = arg1, arg2, arg3, callback //need keyword this?
        
        //decode and use response
        var dbData = JSON.parse(response).pets;

        //start makin' Animals
        makeAnimals(dbData);

    });
}


//ajax
function dbUtility (apiFn, apiKey, apiArgs, callback, animal) {

    var apiArgsString = apiArgs; //TODO: expand to allow for multiple varied api args to be accepted

    //create XHR Object
    var xmlhttp = new XMLHttpRequest;
    //call the open function, GET-type of request, url, true-asynchronous
    xmlhttp.open("GET", "https://api.adoptapet.com/search/"+apiFn+"?output=json&key="+apiKey+apiArgs, true);
    //call the onload 
    xmlhttp.onreadystatechange = function() {
        //check if the status is ready and ok
        if (this.readyState == 4 && this.status === 200) {
            //retrieve server response as object
            if(callback) {
            	callback(this.responseText, animal);
            }
        }
    }
    //call send
    xmlhttp.send();
}


//store all Animals
var anmlObjs = [];
function makeAnimals (dbData) {

    //iterate over all animals available in db
    for (var i = 0; i < dbData.length; i++) {
        var datapoint = dbData[i];

        //retrieve and reformat data

        //retrieve id
        var id = datapoint.pet_id;

        //retrieve name
        var name = datapoint.pet_name;

        //retrieve photo
        var photo = datapoint.large_results_photo_url;

        //reformat sex and age into stats
        var sex = (datapoint.sex == "m") ? "Male" : "Female";
        var age = datapoint.age ? datapoint.age : "";
        age = age.charAt(0).toUpperCase() + age.slice(1);
        var stats = age ? (sex + ", " + age) : sex;

        //reformat city and state into location
        var city = datapoint.addr_city;
        var state = datapoint.addr_state_code;
        var location = city + ", " + state;

        //retrieve breed(s)
        var breed = datapoint.primary_breed + (datapoint.secondary_breed ? "/" + datapoint.secondary_breed : "");

        //construct Animal obj for each animal
        var anml = new Animal(id, name, photo, stats, location, breed);
        //store each Animal obj in anmlObjs data structure
        anmlObjs.push(anml);


    }
    
}

//adjust db data (for purposes of coding exercise, to demonstrate all requested functionality)
function trivialDetails (dbData) {
	//note: database didn't return response that included any hits for the below attributes;
	//      attributes were either missing or set to false)
	//      fn: manually set attribute values from db-ed data

	//randomly assign boolean pet states by generating random integer between 1 and 3, inclusive
	dbData.adopted = randInt(1, 3) === 1;
	dbData.act_quickly = randInt(1, 3) === 1 && !dbData.adopted; //so banners don't overlay each other
	dbData.special_needs = randInt(1, 3) === 1;
	dbData.bonded_pair = randInt(1, 3) === 1;

	return dbData;
}

//give an integer random number between min (included) and max (included)
function randInt (min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

//replace HTML character references with human-readable chars
function recodeText (text) {
	if(text != null) {
		return text.replace(new RegExp('&#39;', 'g'), '\''); 
	}
}

//concatenate stats 
function formatText (data) {
	var statsExtra = null;
	if(data.special_needs) {
		statsExtra = "Special needs";
	}
	if(data.bonded_pair) {
		if(statsExtra != null) {
			statsExtra += ", Bonded pair";
		} else {
			statsExtra = "Bonded pair";
		}
	}
	return statsExtra;
}

//take anmlObjs from one scope and update it in another
function updateAnmlObjs (anmlObjs) {
	document.getElementById('cardsContainer').__x.$data.anmlObjs = anmlObjs;
}





//Filter obj
function Filter () {

	return {
	  //properties
	  selectedFilter: "Filter", //default; stores selected dropdown option
	  droppedDown: false, //shows whether dropdown open or not
	}

}
var fltrObj = new Filter();