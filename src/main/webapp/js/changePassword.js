var chagePassModule = angular.module("atabChangePassword", []);



chagePassModule.controller("changePasswordController", function($scope, $http, $location)
{	
	var user = "";
	var challenge = "";
	var signature = "";
	
	$scope.invalidFormData = false;
	$scope.changingPassword = true;
	
	
	function initForm()
	{	
		$scope.emptyPassword = false;
		$scope.nonMatchingPasswords = false;
		
		user = $location.search()._user;
		challenge = $location.search()._chg;
		signature = $location.search()._sig;
		
		if (!user || user == undefined || !challenge || challenge == undefined 
				|| !signature || signature == undefined)
		{
			$scope.validFormData = false;
			
			return;
		}
		
		$scope.passwordChanged = false;
		$scope.changingPassword = true;
		$scope.invalidFormData = false;
		$scope.invalidSecurity = false;
		$scope.expiredRequest = false;	
		$scope.updateError = false;	
	}	
	
	$scope.updatePassword = function()
	{
		$scope.emptyPassword = false;
		$scope.nonMatchingPasswords = false;
		
		$scope.invalidSecurity = false;
		$scope.expiredRequest = false;	
		$scope.updateError = false;	
		
		if ($scope.newPass.length == 0)
		{
			$scope.emptyPassword = true;
			return;
		}
		else if ($scope.chkPass.length == 0)
		{
			$scope.emptyPassword = true;
			return;
		}
		else if ($scope.chkPass != $scope.newPass)
		{
			$scope.nonMatchingPasswords = true;
			return;
		}
		
		// make the request to update the password
  		var changePassURL = "api/userMgmt/changePassword/" + user + "/" + challenge + "/" + $scope.newPass;
  		
  		console.log("Updating password");
  		
  		var submitter = $http.post(changePassURL, signature);
  		
  		submitter.success(function (data, status)
  		{
			$scope.changingPassword = false;
  			$scope.passwordChanged = true;
  			$scope.loginURL = data;
  		});	
  		
  		submitter.error(function (data, status)
  		{
  			if (status == 401)
  			{
  				$scope.changingPassword = false;
  				$scope.invalidFormData = true;
  				$scope.invalidSecurity = true;

  			}
  			else if  (status == 410)
  			{
  				$scope.changingPassword = false;
  				$scope.invalidFormData = true;
  				$scope.expiredRequest = true;				
  			}
  			else
  			{
  				$scope.updateError = true;	
  			}
  			console.log("Password change failed");
  		});
	}
	

	
	initForm();
});

chagePassModule.config(function($locationProvider) 
{
    $locationProvider.html5Mode(true);
});

