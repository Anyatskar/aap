
function petsData() { //global
	return {
		pets:[],
		detailed:null,
		dropdownSelected:"Filter",
		getPets:function () {
			//Create the XHR Object
			var xmlhttp = new XMLHttpRequest;
			//Call the open function, GET-type of request, url, true-asynchronous
			xmlhttp.open("GET", "https://api.adoptapet.com/search/pet_search?output=json&key=e41b6bf1618d053c31d524d479c14b4y&geo_range=1&city_or_zip=San%20Francisco,%20CA&species=dog", true);
			//call the onload 
			var that = this;
			xmlhttp.onreadystatechange = function() {
		        //check if the status is ok
		        if (this.readyState == 4 && this.status === 200) {
		            //return server response as an object with JSON.parse
					that.pets = that.formatData(JSON.parse(this.responseText).pets);
					that.petDetails();
				}
			}
			//call send
			xmlhttp.send();
		},
		formatData:function (data) {

			for (var i = 0; i < data.length; i++) {
				var datapoint = data[i];
			
				var name = datapoint.pet_name;

				var breed = datapoint.primary_breed + (datapoint.secondary_breed ? "/" + datapoint.secondary_breed : "");

				var sex = (datapoint.sex == "m") ? "Male" : "Female";
				var age = datapoint.age ? datapoint.age : "";
				age = age.charAt(0).toUpperCase() + age.slice(1);
				var stats = age ? (sex + ", " + age) : sex;

				var city = datapoint.addr_city;
				var state = datapoint.addr_state_code;
				var location = city + ", " + state;

				var obj = {
					"name": name,
					"breed": breed,
					"stats": stats,
					"location": location,
					"details": {},
					"favourited": false
				}

				datapoint.result = obj; //new attr
			}

			return data;
		},
		petDetails:function () {
			for (var i = 0; i < this.pets.length; i++) {
				var pet = this.pets[i];
				this.getPet(pet.pet_id, i);
			}
		},
		getPet:function (id, i) {
			//Create the XHR Object
			var xmlhttp = new XMLHttpRequest;
			//Call the open function, GET-type of request, url, true-asynchronous
			xmlhttp.open("GET", "https://api.adoptapet.com/search/pet_details?output=json&key=e41b6bf1618d053c31d524d479c14b4y&pet_id="+id, true);
			//call the onload 
			var that = this;
			xmlhttp.onreadystatechange = function() {
		        //check if the status is ok
		        if (this.readyState == 4 && this.status === 200) {
		            //return server response as an object with JSON.parse
		            var tempDetails = JSON.parse(this.responseText).pet;
		            //note: trivially adding data to db, since doesn't contain these flags to show off code!
		            tempDetails = trivialDb(tempDetails, i);
		            that.pets[i].result.details = that.formatDetails(tempDetails);
				}
			}
			//call send
			xmlhttp.send();
		},
		formatDetails:function (details) {
			//format extra stats
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

function trivialDb (tempDetails, i) {
	tempDetails.adopted = (i % 8)===1;
	tempDetails.act_quickly = (i % 5)===1 && !tempDetails.adopted;
	tempDetails.special_needs = (i % 6)===1;
	tempDetails.bonded_pair = (i % 9)===1;

	return tempDetails;
}

function filter () {
	return {
		droppedDown: false,
		selectedFilter: "Filter",
	}
}

/**
 * returns em size of a give pixels on an element with a given fontsize
 * @param  {number}   fontsize  font-size in px of the div you're adding something to
 * @param  {number}    px       number of px you want to convert to ems
 * @return {string}            px represented as ems in the given font size
 * @author ayatskar
 * @date   10-18-2020
 */
function getEms (fontsize, px) {
	return (px/fontsize+"em");
}