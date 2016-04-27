// incrDate
//
function incrDate (xdate, cnt)
{
	xdate.setDate( xdate.getDate() + cnt);
	return (cnt);
}

// d1 - earlier day as date object
// d2 - later day as date object
// UTC is timezone friendly
function deltaDates (d1, d2) {
	
  var ud1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
  var ud2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
  
  return ( Math.floor((ud2 - ud1) / (1000*60*60*24)));
}


// Using count of adjusted days and nbr of days in a rotation
// calculate value for todays day
// adj if first day of school wasn't a 1
//
function toTodaysDay(adjdays, daysinrot, startday) {
	
	var todaysday = (adjdays %daysinrot) ? (adjdays %daysinrot) : daysinrot;
	return ( todaysday + (startday -1) );  
}

	// Text string with - separated fields MM-DD-YYYY
	// returned in Date format
function toDate(dateStr) {
    
	var elements = dateStr.split("-");
	var year = elements[2];
	var mon = elements [0] -1;
	var day = elements [1];
    return new Date(year, mon, day); 
}

// if today is a weekend incr date to next monday
// returns nbr of days added     and sets enddate
function toNextWeekday (xdate)
{
	var wkday = 0;  // 0-6  eq  Sun to Sat
	var cnt = 0;
	
	wkday = xdate.getDay();
	
	while (wkday==0 || wkday==6) {
		cnt++;
		incrDate (xdate, 1);
		wkday = xdate.getDay();	
	}
			
	return (cnt);
}

// returns string for next school day header msg
// expect sdmsg preset at: Today is Day
//
function setSDMsg (today, xtoday, sdmsg) {
	var adjmsg;
	var res = 0;
		
	res = deltaDates (today, xtoday);
	if (res == 0) {
		return (sdmsg);
		
	} else {
	
		switch (xtoday.getDay()) {
		case 1:
        	adjmsg = sdmsg.replace("Today", "Monday");
        	break;
    	case 2:
        	adjmsg = sdmsg.replace("Today", "Tuesday");
        	break;
    	case 3:
        	adjmsg = sdmsg.replace("Today", "Wednesday");
        	break;
    	case 4:
        	adjmsg = sdmsg.replace("Today", "Thursday");
        	break;
   	 	case 5:
    	 	adjmsg = sdmsg.replace("Today", "Friday");
       		break;
		case 0:
		case 6:
		default:
			adjmsg = sdmsg.replace("Today", "Error");
			break;
		}
	}
	return (adjmsg);
}


// Obtain deltadays from start of school
// subtract weekends and noschoolon days - upto current day
//
function toAdjDays (nsodays, rawdays, startdate, xtoday) {
	var nWEnds = 0;
	var weekday1 = 0;
	var weekday2 = 0;		
	
	
	weekday1 = startdate.getDay();
	weekday2 = xtoday.getDay();
	
	if (weekday1 > weekday2) {
		nWEnds = Math.ceil(rawdays / 7);
	} else {
		nWEnds = Math.floor(rawdays / 7);
	}
	
	rawdays = deltaDates( startdate, xtoday) +1;			
	return (rawdays - (nWEnds * 2) -nsodays);
}


myapp = angular.module('nsoApp', []);

myapp.controller('nsoCtl', function ($scope, $http){
	$http.get('../json/noschoolon.json').success(function(data) {
		var today = new Date();	
		var xtoday = new Date();  // today or next valid seq today
		var startdate = toDate (data.school.startdate);  
		var startday = Number(data.school.startday);
		var enddate = toDate(data.school.enddate); 
		var restartdate = toDate(data.school.restartdate);    
		var daysinrot = Number(data.school.nDaysRotation); 
		var nsoarray = data.noSchoolDays; 
		var adjdays = 0;  
		var rawdays = 0;   
		var nsodays = 0; 
		var todaysday = 0;  // (1-n)
		var wkdstart = 0;
		var wkdtoday = 0;
		var sdmsg = "Today is Day";
		var vacmsg = "Days Till School";
		var res = 0;
		var cnt = 0;
		var len = 0;
		var flDone = false;		
		
		$scope.nsodata = data;	 
		
		// Ck Is school out?
		if (deltaDates(today, enddate) < 0) {
			rawdays = deltaDates(today,restartdate);
			$scope.todaysday = rawdays;
			$scope.schooldaymsg = vacmsg;
		} 
		else {
			
			// to today or if wkend next consequtive weekday .. note may be holiday
 			cnt = toNextWeekday (xtoday);
				
			// Run through nso list and 
			// count nsodays <= xtoday 
			len = nsoarray.length; 
			for (var i=0; (i<len && !flDone); i++)
			{
				res = deltaDates (toDate(nsoarray[i].nsdate), xtoday);
				if ( res <= 0) {
					// zero eq today,   neg is past today
					if (res == 0) {  // keep searching may be in middle of holiday
					
						nsodays++;	
						incrDate (xtoday, 1);    // move past current today							
						toNextWeekday (xtoday);  // if now wkend move past
				
					} else {  // pasttoday done, exit loop
						flDone = true;
					}
				
				} else {    // still before today, keep walking, skipping weekends
					nsodays++;  
					toNextWeekday (xtoday);
				}
			}	
			rawdays = deltaDates(startdate,xtoday) +1;		
			
			// Set school day msg
			//    Today is Day    or  M-F is Day
			$scope.schooldaymsg = setSDMsg (today, xtoday, sdmsg); 
			
			// Looking for school day number now (1-6)
			// adjust for weekends and nsodays
			// take into consideration if school start day was not 1
			//
			adjdays = toAdjDays (nsodays, rawdays, startdate, xtoday);

			todaysday = toTodaysDay (adjdays, daysinrot, startday);
			$scope.todaysday = todaysday;
	
		}
			
	}, function(res) {
        //Second function handles error
		//
        $scope.nsodata = "Something went wrong";
	
    });
});

