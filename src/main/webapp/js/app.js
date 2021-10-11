 function reloadCaptchaImage(captchaImageId) 
 {
	var obj = document.getElementById(captchaImageId);
	var src = obj.src;
	var date = new Date();
	var pos = src.indexOf('&rad=');
	if (pos >= 0) 
	{ 
		src = src.substr(0, pos); 
    }

	
	obj.src = src + '&rad=' + date.getTime();
	return false; 
  }

angular.module('Authentication', []);


var tableData = {};

var sourceAddrData = {};

var usersData = {};

var currentTestSuiteId = 0;

var startTime = 0;

var currentReportAddr;

var atabModule = angular.module("atabInterop", ['Authentication', 'ngCookies']);


    
atabModule.controller("atabController", function($scope, $http, $rootScope, $cookieStore, AuthenticationService)
		{	
  	var interval;

  	
  	$scope.timoutOptions = [
  	          			    {
  		         				   name: '2',
  		         				   value: '2'
  		         				}, 
  		         				{
  		         					name: '3',
  		         					value: '3'
  		         				},
  		         				{
  		         					name: '4',
  		         					value: '4'
  		         				},	
  		         				{
  		         					name: '5',
  		         					value: '5'
  		         				}					
  		         			];
  	
  	$scope.roleOptions = [
  	          			    {
  		         				   name: 'REQUESTED',
  		         				   value: 'REQUESTED'
  		         				}, 
  		         				{
  		         					name: 'VETTING',
  		         					value: 'VETTING'
  		         				},
  		         				{
  		         					name: 'APPROVED',
  		         					value: 'APPROVED'
  		         				},	
  		         				{
  		         					name: 'SUSPENDED',
  		         					value: 'SUSPENDED'
  		         				},	
  		         				{
  		         					name: 'TERMINATED',
  		         					value: 'TERMINATED'
  		         				}	  		         				
  		         			];
  	
  	$scope.accStatus = {};
  	$scope.loggedInUserName = "";
  	
  	$scope.resetRecieveForm = function()
  	{
  		currentTestSuiteId = 0;
  		startTime = 0;
  		tableData = {};
  		$scope.validAdditionalReportToAddress = true;
  		$scope.validReportAddress = true;
  		$scope.validToAddress = true;			
  		$scope.testRunning = false;
  		$scope.resultData = tableData;
  		$scope.currentTestProgress = "Initiated.  Waiting to get status.";
  		$scope.elapsedTestTime = 0;
  		$scope.resetAvail = false;
  		$scope.additionalReportAddress = "";
  		$scope.reportAddress = "";	
  		$scope.toAddress = "";
  		$scope.additionalReportSent = false;
  		
  		if (interval)
  		  clearInterval(interval);
  	}
  	
  	$scope.resetRegForm = function()
  	{
  		currentReportAddr = "";
  		sourceAddrData = {};
  		$scope.regResultData = sourceAddrData;
  		$scope.loadedSourceAddr = false;
  		$scope.noSourcesReged = false;
  		$scope.validRegReportAddr = true;
  		$scope.validAddReportAddr = true;
  		$scope.sourceRegAddressAlreadyExist = false;
  		$scope.regedReportAddress = "";
  	}
  	
  	$scope.resetSelfRegForm = function()
  	{
  		$scope.inputSelfRegForm = true;
  		$scope.selfRegSuccess = false;
  		$scope.showAddRegGeneralFailure = false
  		$scope.showMissingRegFields = false;
		$scope.regEmailAddressDontMatch = false;
  		$scope.showUserNameTaken = false;
  		$scope.selfRegFirstName = "";
  		$scope.selfRegLastName = "";
  		$scope.selfRegUsername = "";
  		$scope.selfRegPassword = "";
  		$scope.selfRegCity = "";
  		$scope.selfRegState = "";
  		$scope.selfRegPhone = "";
  		$scope.selfRegOrg = "";
  		$scope.selfRegEmail = "";
  		$scope.selfRegEmailRepeat = "";  		
  		$scope.captchaCode = "";
  	}
  	
  	$scope.resetForgotPasswordForm = function()
  	{
  		$scope.inputForgotPassword = true;
  		$scope.forgotPasswordSend = false;
  		$scope.changePassUsername = "";
  		
  	}
  	
  	$scope.initAdminForm = function()
  	{
  		$scope.updatingUsers = false;
  		$scope.userList = {};
  		$scope.userList = {};
  		$scope.noAminUsers = true;
  	}
  	
  	$scope.startLogin = function()
  	{
  	  	$scope.loggedInUserName = "";  		
  		$scope.signIn = true;
  		$scope.selfReg = false;
  	    $scope.adminUser = false;
  		
  	    $scope.resetSelfRegForm();
  	    $scope.resetForgotPasswordForm();
  	    
  		$scope.loginErrorMessage = "";
  		
        $rootScope.globals = $cookieStore.get('globals') || {};
        if ($rootScope.globals.currentUser) 
        {
            $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata; // jshint ignore:line
      	    $scope.loggedIn = true;
      	    $scope.adminUser = ($rootScope.globals.currentUser.role == "ADMIN")

      	    $scope.loggedInUserName = $rootScope.globals.currentUser.username;
      	    
      	    if ($scope.adminUser)
      	    	loadAdminUsers();
        }
        else
        {
        	$scope.loggedIn = false;
        }
  	}
  	
  	$scope.cancelSelfReg = function()
  	{
  		$scope.signIn = true;
  		$scope.selfReg = false;
  		$scope.resetSelfRegForm();
  	    $scope.username = "";
  	    $scope.password = "";
  	    $scope.loginErrorMessage = "";
  	}
  	
  	$scope.cancelForgotPassword = function()
  	{
  		$scope.signIn = true;
  		$scope.forgotPassword = false;
  		$scope.resetForgotPasswordForm();
  	    $scope.username = "";
  	    $scope.password = "";
  	    $scope.loginErrorMessage = ""; 		
  	}
  	
  	$scope.requestChangePassword = function()
  	{
    	if (!$scope.changePassUsername || $scope.changePassUsername == undefined)
    	{
    		return;
    	}
    	
  		var changePasswordUrl = "api/userMgmt/forgotPassword/" + $scope.changePassUsername;
  		
 		console.log("Submitting change password request: " + changePasswordUrl);
 		
  		var submitter = $http.post(changePasswordUrl);
  		
  		submitter.success(function (data, status)
  		{
  			console.log("Submitted change password request.");
  			$scope.inputForgotPassword = false;
  			
  			$scope.forgotPasswordSend = true;
  		});	
  		
  		submitter.error(function (data, status)
  		{
  			$scope.inputForgotPassword = false;
  			
  			$scope.forgotPasswordSend = true;
  		});	 		
  	}
  	
    $scope.selfRegUser = function()
    {

		$scope.showMissingRegFields = false;
		$scope.regEmailAddressDontMatch = false;
    	if (! $scope.signupForm.$valid)
    	{
    		$scope.showMissingRegFields = true;
    		return;
    	}
    	
    	if ($scope.selfRegEmail != $scope.selfRegEmailRepeat)
    	{
    		$scope.regEmailAddressDontMatch = true;
    		return;
    	}
    	
		$scope.regEmailAddressDontMatch = false;
    	$scope.showMissingRegFields = false;
    	$scope.showUserNameTaken = false;
    	$scope.showAddRegGeneralFailure = false;
    	
    	// self register
    	var selfRegUser = {
    			firstName : $scope.selfRegFirstName,
    			lastName : $scope.selfRegLastName,
    			addressCity : $scope.selfRegCity,
    			addressState : $scope.selfRegState,
    			addressState : $scope.selfRegState,
    			username : $scope.selfRegUsername,
    			hashedPass : $scope.selfRegPassword,
    			contactEmail : $scope.selfRegEmail,
    			contactPhone : $scope.selfRegPhone,
    			organization : $scope.selfRegOrg
    	  };
    	
  		var selfRegURL = "api/userMgmt";
  		
  		console.log("Submitting user self reg: " + selfRegURL);
  		
  		var submitter = $http.put(selfRegURL, selfRegUser);
  		
  		submitter.success(function (data, status)
  		{
  			console.log("User self reged");
  			$scope.inputSelfRegForm = false;
  			
  			$scope.selfRegSuccess = true;
  		});	
  		
  		submitter.error(function (data, status)
  		{
  			if (status == 409)
  				$scope.showUserNameTaken = true;
  			else
  		    	$scope.showAddRegGeneralFailure = true;
  		});	
    }
  	
  	$scope.sendReport = function()
  	{
  		$scope.validAdditionalReportToAddress = true;
  		$scope.additionalReportSent = false;
  		
  		if ($scope.additionalReportAddress == undefined)
  		{
  			$scope.validAdditionalReportToAddress = false;
  			return;
  		}
  			
  		if (!$scope.additionalReportAddress)
  		{
  			return;
  		}

  		$scope.validAdditionalReportToAddress = true;
  		
  		var submitReportURL = 'api/interopTest/sendTests/sendReport/' + currentTestSuiteId + "/" + $scope.additionalReportAddress;
  		
  		console.log("Submitting test reporting: " + submitReportURL);
  		
  		var submitter = $http.post(submitReportURL);
  		
  		submitter.success(function (data, status)
  		{
  			console.log("Report submitted");
  			$scope.additionalReportSent = true;
  			
  			loadedSourceAddr = true;
  		});	
  		
  		submitter.error(function (data, status)
  		{
	    	if (response == 401)
	        {
	    		$scope.loggedIn = false;
	    		$scope.loginErrorMessage = "Session Timed Out";
	    		$scope.resetSelfRegForm();
	    		$scope.resetForgotPasswordForm();
	    		
	      		if (interval)
	        		  clearInterval(interval);
	        }
  		});	
  	}
  	
  	$scope.submitTest = function()
  	{
  		$scope.validReportAddress = true;
  		$scope.validReportAddress = true;
  		
  		// make sure we have a valid email address
  		if (!$scope.toAddress)
  		{
  			
  			$scope.validToAddress = false;
  			return;
  		}
  		$scope.validToAddress = true;
  		
  		if ($scope.reportAddress == undefined)
  		{
  			$scope.validReportAddress = false;
  			return;
  		}
  		$scope.validReportAddress = true;
  		
  		startTime = new Date().getTime();
  		

  		var submitURL = 'api/interopTest/sendTests/' + $scope.toAddress + "/" + $scope.testTimeout.value;
  		if ($scope.reportAddress)	
  			submitURL += "/" + $scope.reportAddress;
  		
  		console.log("Submitting test for initiation: " + submitURL);
  		
  		var submitter = $http.post(submitURL);
  		$scope.testRunning = true;
  		
  		
  		submitter.success(function (data, status)
  		{
  			console.log("Called submitted test id: " + data);
  			currentTestSuiteId = data;
  			
  			interval = setInterval(getStatusData, 5000);
  		});
  		
  		submitter.error(function (data, status)
  		{
	    	if (response == 401)
	        {
	  			$scope.loggedIn = false;
	    		$scope.loginErrorMessage = "Session Timed Out";
	    		$scope.resetSelfRegForm();
	    		$scope.resetForgotPasswordForm();
	    		
	      		if (interval)
	        		  clearInterval(interval);
	        }
  		});	
  	}
  	
  	$scope.userStatusToTableClass = function(accountStatus)
  	{
  		if (accountStatus == "REQUESTED" || accountStatus == "VETTING")
  			return "warning";
  		else if (accountStatus == "APPROVED")
  			return "success";
  		else if (accountStatus == "SUSPENDED") 	
  			return "info";
  		else 
  			return "danger";
  	}
  	
  	$scope.userStatusToSelectionObject = function(accStat)
  	{
  		for (var idx = 0; idx < $scope.roleOptions.length; idx++)
  		{
  			
  			if ($scope.roleOptions[idx].name == accStat)
  				return $scope.roleOptions[idx];
  		}
  		
  		return $scope.roleOptions[idx];
  	}
  	
  	function getStatusData()
  	{
  		var nowTime = new Date().getTime();
  		$scope.elapsedTestTime = (nowTime - startTime) /1000;
  		
  		console.log("Called getStatusData with id " + currentTestSuiteId);
  		var statusRequestor = $http.get('api/interopTest/sendTests/' + currentTestSuiteId);
  		
  		statusRequestor.success(function (data, status)
  		{
  			$scope.resultData = data.tests;
  			
  			$scope.currentTestProgress = data.testStatus;
  			
  			if (!(data.testStatus == "RUNNING" || data.testStatus == "INITIATED"))
  			{
  				clearInterval(interval);
  				$scope.resetAvail = true;
  			}
  		});
  		
  		
  	}
  	
  	$scope.loadSourceAddr = function() 
  	{
  		if (!validateEmail($scope.regedReportAddress))
  		{
  			$scope.validRegReportAddr = false;
  			return;
  		}
  		
  		$scope.validRegReportAddr = true;
  		$scope.validAddReportAddr = true;
  		$scope.sourceRegAddressAlreadyExist = false;
  		$scope.newSourceAddress = "";
  		
  		var regRequestor = $http.get('api/interopReg/reportAdd/' + $scope.regedReportAddress);

  		regRequestor.success(function (data, status)
  		{
  			sourceAddrData = data;
  			$scope.regResultData = sourceAddrData;
  			
  			$scope.loadedSourceAddr = true;
  			$scope.noSourcesReged = (!data || data.length == 0);

  			currentReportAddr = $scope.regedReportAddress;
  			
  		});
  		
  		regRequestor.error(function (data, status)
  		{
	    	if (response == 401)
	        {
	  			$scope.loggedIn = false;
	    		$scope.loginErrorMessage = "Session Timed Out";
	    		$scope.resetSelfRegForm();
	    		$scope.resetForgotPasswordForm();
	    		
	      		if (interval)
	        		  clearInterval(interval);
	        }
  		});			
  	}
  	
  	$scope.addSourceAddr = function()
  	{
  		if (!validateEmail($scope.newSourceAddress))
  		{
  			$scope.validAddReportAddr = false;
  			return;
  		}
  		
  		$scope.validAddReportAddr = true;
  		
  		console.log("Registering new source address " + $scope.newSourceAddress);
  		
  		var regRequestor = $http.put('api/interopReg/' + currentReportAddr + "/" +  $scope.newSourceAddress);
  		
  		regRequestor.success(function (data, status)
  		{
  			$scope.sourceRegAddressAlreadyExist = false;
  			$scope.loadSourceAddr();			
  		});
  		
  		regRequestor.error(function (data, status)
  		{
  			if (status == 409)
  			{
  				$scope.sourceRegAddressAlreadyExist = true;
  			}
  			else if (response == 401)
	        {
	    		$scope.loggedIn = false;
	    		$scope.loginErrorMessage = "Session Timed Out";
	    		$scope.resetSelfRegForm();
	    		$scope.resetForgotPasswordForm();
	    		
	      		if (interval)
	        		  clearInterval(interval);
	        }  			
  	    });

  	}
  	
  	$scope.deleteSourceAddr = function()
  	{	
  		var ids = "";
  		
  		for (idx = 0; idx < sourceAddrData.length; idx++)
  		{
  			
  			var checkBox = document.getElementById(sourceAddrData[idx].registrationId);
  			
  			if (checkBox && checkBox.checked)
  			{
  				if (ids.length > 0)
  				{
  					ids += ",";
  				}
  				ids += checkBox.value;
  			}
  		}
  		
  		if (ids.length > 0)
  		{
  			console.log("Deleting source address with ids: " + ids);
  			var regRequestor = $http.delete('api/interopReg/' + ids);
  			
  			regRequestor.success(function (data, status)
  			{
  				$scope.loadSourceAddr();			
  			});
  		}
  		else
  		{
  			console.log("Nothing to delete");
  		}
  	}
  	
  	$scope.adminUpdateUser = function()
  	{
  		console.log("Updating users");
  		
  		var ids = "";
  		
  		var updateUsers = [];
  		
  		var updIdx = 0;
  		
  		for (idx = 0; idx < $scope.userList.length; idx++)
  		{
  			
  			var checkBox = document.getElementById($scope.userList[idx].userId);
  			
  			if (checkBox && checkBox.checked)
  			{
  				var newStatus = $scope.accStatus[$scope.userList[idx].username].value;
  				
  				
  				updateUsers[updIdx++] = { username: $scope.userList[idx].username, 
  						                  accountStatus : newStatus}; 
  			}
  		}	
  		
  		if (updateUsers.length > 0)
  		{
  			$scope.updatingUsers = true;
  			var regRequestor = $http.post('api/userMgmt/updateUserAccountStatus', updateUsers);
  			
  			regRequestor.success(function (data, status)
  			{
  				$scope.initAdminForm();
  				loadAdminUsers();		
  			});
  			
  	  		regRequestor.error(function (data, status)
  	  	  	{
  	  			$scope.updatingUsers = false;
  		    	if (response == 401)
  		        {
  		  			$scope.loggedIn = false;
  		    		$scope.loginErrorMessage = "Session Timed Out";
  		    		$scope.resetSelfRegForm();
  		    		$scope.resetForgotPasswordForm();
  		    		
  		      		if (interval)
  		        		  clearInterval(interval);
  		        }
  	  	  	});	
  			
  		}
  	}
  	
  	function validateMultiEmail(email) 
  	{
  		var validAddress = true;
  		var addresses = email.split(",");
  		for (idx = 0; idx < addresses.length; idx++)
  		{
  			if (!validateEmail(addresses[idx]))
  				return false;
  		}

  		
  		return true;
  	}	
  	
  	function validateEmail(email) 
  	{
  		var input = document.createElement('input');
  		input.type='email';
  		input.value=email; 
  		
  		return input.checkValidity();
  	}	

      $scope.login = function () 
      {     	
          if ($scope.username == undefined || $scope.password == undefined)
          {
        	  return;
          }    	  
    	  
          $scope.dataLoading = true;
          AuthenticationService.Login($scope.username, $scope.password, function(response, data) 
          {
              if(response == 200) 
              {
            	 $scope.adminUser = (data.role == "ADMIN")
            	 $scope.resetRecieveForm();
            	 $scope.resetRegForm(); 
            	 $scope.loggedInUserName = data.username;
                 AuthenticationService.SetCredentials($scope.username, $scope.password, data.role);
                 $scope.loggedIn = true;
                 $scope.loginErrorMessage = "";
                 
                 if ($scope.adminUser)
                 {
                	 $scope.initAdminForm();
                	 loadAdminUsers();
                 }
                 

              } 
              else 
              {
            	 $scope.loggedIn = false;
            	 if (response == 401)
            		 $scope.loginErrorMessage = "Invalid Login";
            	 else
            		 $scope.loginErrorMessage = "Login Service Error";
              }
          });
      };
  	
    $scope.logout = function()
    {
  		if (interval)
  		  clearInterval(interval);
    	
  	    AuthenticationService.ClearCredentials();
  	    
  	    $scope.username = "";
  	    $scope.password = "";
  		$scope.loginErrorMessage = "";
  	    $scope.loggedIn = false;
  	    
  	    $scope.resetSelfRegForm();
		$scope.resetForgotPasswordForm();  	    
    }
  
    
    function loadAdminUsers()
    {
  		console.log("Retrieving user list for user management.");
  		var regRequestor = $http.get('api/userMgmt');

  		regRequestor.success(function (data, status)
  		{
  			console.log("Got user list.");
  			$scope.userList = data;
  			if (data.length == 0)
  				$scope.noAminUsers = true;
  			else
  				$scope.noAminUsers = false;
  		});
  		
  		regRequestor.error(function (data, status)
  		{
	    	if (status == 401)
	        {
	  			$scope.loggedIn = false;
	    		$scope.loginErrorMessage = "Session Timed Out";
	    		
	      		if (interval)
	        		  clearInterval(interval);
	        }
  		});		    	
    }
    
  	console.log("Reset Forms");
  	$scope.resetRecieveForm();
  	$scope.resetRegForm();
  	$scope.resetForgotPasswordForm();
  	$scope.startLogin();
  	
});



/*
appModule.run(['$rootScope', '$location', '$cookieStore', '$http',
    function ($rootScope, $location, $cookieStore, $http) {
        // keep user logged in after page refresh
        $rootScope.globals = $cookieStore.get('globals') || {};
        if ($rootScope.globals.currentUser) {
            $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata; // jshint ignore:line
        }
  
    }]);
*/