/**
 * fetches pets data for all pets
 * @return {object}   queries pet_search resource db for info on all available pets in given area
 * @author ayatskar
 * @date   10-16-2020
 */
function petsData () { //global scope
	return {

		pets:[], //stores pets data for all pets
		detailed:null, //saves which specific pet's details are open
		dropdownSelected:"Filter", //initialized dropdown filter

		//calls to pet_search pets db for data
		getPets:function () {
			//create XHR Object
			var xmlhttp = new XMLHttpRequest;
			//call the open function, GET-type of request, url, true-asynchronous
			xmlhttp.open("GET", "https://api.adoptapet.com/search/pet_search?output=json&key=e41b6bf1618d053c31d524d479c14b4y&geo_range=1&city_or_zip=San%20Francisco,%20CA&species=dog", true);
			//call the onload 
			var that = this;
			xmlhttp.onreadystatechange = function() {
		        //check if the status is ready and ok
		        if (this.readyState == 4 && this.status === 200) {
		            //retrieve server response as an object with JSON.parse
		            //saves object containing relevant ui-display info
					that.pets = that.formatData(JSON.parse(this.responseText).pets); //formats pets data
					that.petDetails(); //adds additional details to each pet of pets data
				}
			}
			//call send
			xmlhttp.send();
		},

		//formats original pets data into ui-displayable format
		formatData:function (data) {

			for (var i = 0; i < data.length; i++) {

				var datapoint = data[i];
			
				var name = datapoint.pet_name;

				var breed = datapoint.primary_breed + (datapoint.secondary_breed ? "/" + datapoint.secondary_breed : "");

				//reformats sex and age into stats info
				var sex = (datapoint.sex == "m") ? "Male" : "Female";
				var age = datapoint.age ? datapoint.age : "";
				age = age.charAt(0).toUpperCase() + age.slice(1);
				var stats = age ? (sex + ", " + age) : sex;

				//reformats location info
				var city = datapoint.addr_city;
				var state = datapoint.addr_state_code;
				var location = city + ", " + state;

				//creates new object containing relevant ui-display info
				var obj = {
					"name": name,
					"breed": breed,
					"stats": stats,
					"location": location,
					"details": {},
					"favourited": false
				}

				//creates and adds new attr (result) using above new object
				datapoint.result = obj;
			}

			return data;
		},

		//adds further detail to each pet of pets data
		petDetails:function () {
			for (var i = 0; i < this.pets.length; i++) {
				var pet = this.pets[i];
				this.getPet(pet.pet_id, i); //retrieves pet data for individual pet
			}
		},

		//calls to pet_details pet db for data
		getPet:function (id, i) {
			//create XHR Object
			var xmlhttp = new XMLHttpRequest;
			//call the open function, GET-type of request, url, true-asynchronous
			xmlhttp.open("GET", "https://api.adoptapet.com/search/pet_details?output=json&key=e41b6bf1618d053c31d524d479c14b4y&pet_id="+id, true);
			//call the onload 
			var that = this;
			xmlhttp.onreadystatechange = function() {
		        //check if the status is ready and ok
		        if (this.readyState == 4 && this.status === 200) {
		            //retrieve server response as an object with JSON.parse
		            var tempDetails = JSON.parse(this.responseText).pet;
		            //trivially adds data to db, since it naturally didn't contain these flags to show off code!
		            tempDetails = trivialDb(tempDetails, i);
		            //creates and adds new attr (details) to attr result
		            that.pets[i].result.details = that.formatDetails(tempDetails); //updates further pet details object containing relevant ui-display info
				}
			}
			//call send
			xmlhttp.send();
		},

		//format extra stats into ui-displayable format
		formatDetails:function (details) {
			var statsExtra = null;
			if(details.special_needs) {
				statsExtra = "Special needs";
			}
			if(details.bonded_pair) {
				if(statsExtra != null) {
					statsExtra += ", Bonded pair";
				} else {
					statsExtra = "Bonded pair";
				}
			}
			details.stats_extra = statsExtra;

			//housekeeping: replace HTML character references with human-readable chars
			var description = details.description;
			if(description != null) {
				details.description = description.replace(new RegExp('&#39;', 'g'), '\'');
			}

			return details;
		}
	}
}

/**
 * trivially adds pet states data to db, since some states were missing and others were all null
 * @param  {object}   tempDetails pet details retrieved from db
 * @param  {number}   i           index
 * @return {[type]}               [description]
 * @author ayatskar
 * @date   10-17-2020
 */
function trivialDb (tempDetails, i) {
	//adds pet states to every xth pet card
	tempDetails.adopted = (i % 8) === 1;
	tempDetails.act_quickly = (i % 5) === 1 && !tempDetails.adopted; //so banners don't overlay each other
	tempDetails.special_needs = (i % 6) === 1;
	tempDetails.bonded_pair = (i % 9) === 1;

	return tempDetails;
}

/**
 * tracks dropdown filter selections
 * @return {object}   object decribing dropdown filter state
 * @author ayatskar
 * @date   10-17-2020
 */
function filter () {
	return {
		droppedDown: false, //whether filter dropdown is open
		selectedFilter: "Filter", //which dropdown option is selected
	}
}

/**
 * converts px to ems: px represented as ems for element with given fontsize
 * @param  {number}   fontsize font-size in px of the div you're adding something to
 * @param  {number}   px       number of px you want to convert to ems
 * @return {string}            em size of given pixels
 * @author ayatskar
 * @date   10-16-2020
 */
function getEms (fontsize, px) { //helper fn for programming, since most breakpoints scaled without altering proportions of elements with respect to each other
	return (px/fontsize+"em");
}
