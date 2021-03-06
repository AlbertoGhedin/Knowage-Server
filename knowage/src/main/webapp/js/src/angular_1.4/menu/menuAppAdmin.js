/*
 * Knowage, Open Source Business Intelligence suite
 * Copyright (C) 2016 Engineering Ingegneria Informatica S.p.A.
 * 
 * Knowage is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 * 
 * Knowage is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */


var myApp = angular.module('menuAppAdmin', ['ngMaterial', 'sbiModule']);

myApp.controller('menuCtrl', ['$scope','$mdDialog',
	function ($scope,$mdDialog ) {
		$scope.languages = [];
		$scope.openAside = false;
		$scope.toggleMenu = function(){
			$scope.openAside = !$scope.openAside;
		}
	}
]);

myApp.directive('menuAside', ['$window','$http','$mdDialog','$mdToast', 'sbiModule_messaging', 'sbiModule_translate', 'sbiModule_download', '$filter','sbiModule_restServices', 'sbiModule_config', function($window,$http, $mdDialog, $mdToast, sbiModule_messaging, sbiModule_translate, sbiModule_download, $filter, sbiModule_restServices, sbiModule_config) {
    return {

        restrict: 'E',
        templateUrl: Sbi.config.contextName+"/js/src/angular_1.4/menu/templates/menuBarAdmin.html",
        replace: true,
        link:function($scope, elem, attrs) {
        	
        	
        	$scope.testIe11 = function(){
        		$scope.browser = $window.navigator.userAgent;
        		$scope.ie11 = /trident.*rv[ :]*11\./i;
        		var isIe11 = $scope.ie11.test($scope.browser);
        		return isIe11;
        	} 
        	$http.get(Sbi.config.contextName+'/restful-services/1.0/menu/enduser',{
        	    params: { 
        	    		curr_country: Sbi.config.curr_country, 
        	    		curr_language: Sbi.config.curr_language
        	    	}
        	}).success(function(data){
        		$scope.translate = sbiModule_translate;
        		$scope.messaging = sbiModule_messaging;
        		$scope.download = sbiModule_download;
        		$scope.links = [];
        		$scope.fixed = data.fixedMenu;
        		$scope.userName = data.userName;
        		$scope.groups = data.userMenu;
        		if (data.customMenu != undefined && data.customMenu != null && data.customMenu.length > 0){
            		$scope.customs = data.customMenu[0].menu;
        		} else {
        			$scope.customs = {};
        		}
        		
        		
        		//clean the json structure
        		var newJson= new Array();
				angular.forEach($scope.groups, function(value, key) {
					if (typeof(value.menu) != 'undefined')	{
						for (var i=0; i<value.menu.length;i++){
							var newGroups = {};
								newGroups.iconCls = value.menu[i].iconCls ? value.menu[i].iconCls : "";
								newGroups.title = value.menu[i].title ? value.menu[i].title : value.menu[i].text;
								newGroups.items = value.menu[i].items ? value.menu[i].items : value.menu[i].menu;
								newJson.push(newGroups);
								
						}
					} else {
					      $scope.links.push(value);
				     }		
				});
        		
        		$scope.groups = newJson;
        	}).
        	error(function(error){
        		$scope.showAlert('Attention, ' + $scope.userName,"Error Calling REST service for Menu. Please check if the server or connection is working.")
        	});
        	

        	$scope.showAlert = function(title,messageText){
                var alert = $mdDialog.alert()
                .title(title)
                .content(messageText)
                .ok('Close');
                  $mdDialog
                    .show( alert )
                    .finally(function() {
                      alert = undefined;
                    });
        	}
        	
        	$scope.showDialog = function showDialog() {
        	       var parentEl = angular.element(document.body);
        	       $mdDialog.show({
        	         parent: parentEl,
        	         templateUrl: Sbi.config.contextName+"/js/src/angular_1.4/menu/templates/languageDialog.html",
        	         locals: {
        	           languages: $scope.languages
        	         }
        	         ,controller: DialogController
        	      });
        	      function DialogController(scope, $mdDialog, languages) {
        	        scope.languages = languages;
        	        scope.closeDialog = function() {
        	          $mdDialog.hide();
        	        }
        	        scope.menuCall=$scope.menuCall;
        	      }
        	    }

			$scope.redirectIframe = function(url){
				document.getElementById("iframeDoc").contentWindow.location.href = url;
				$scope.openAside = false;
			}
			
			$scope.execUrl = function(url){
				document.location.href = url;
				return;
			}
			
			$scope.roleSelection = function roleSelection(){				
				if(Sbi.user.roles && Sbi.user.roles.length > 1){
					this.win_roles = new Sbi.home.DefaultRoleWindow({'SBI_EXECUTION_ID': ''});
					this.win_roles.show();
				} else {
					$scope.openAside = false;
					$scope.showAlert('Role Selection','You currently have only one role');
				}
			}
			
			$scope.externalUrl = function externalUrl(url){
				window.open(url, "_blank")

			}
			
			$scope.info = function info(){
				$scope.toggleMenu();
				var parentEl = angular.element(document.body);
				$mdDialog.show({
					parent: parentEl,
					templateUrl: Sbi.config.contextName+'/themes/'+Sbi.config.currTheme+'/html/infos.jsp',
					locals: {
						title : LN('sbi.home.Info'),
						okMessage : LN('sbi.general.ok')
					},
					controller: infoDialogController
				});
				
				function infoDialogController(scope, $mdDialog, title, okMessage) {
	        	        scope.title = title;
	        	        scope.okMessage = okMessage;
	        	        scope.closeDialog = function() {
	        	          $mdDialog.hide();
	        	        }
        	      }
			}
			
			
			$scope.openDialog = function openDialog(){
				$scope.toggleMenu();
				var context=Sbi.config;
				var parentEl = angular.element(document.body);
				$scope.licenseData=[];			
				$scope.hostsData=[];			
				
	        	$http.get(Sbi.config.contextName+'/restful-services/1.0/license?onlyValid=true').success(function(data){
	        		if (data.errors){
						$scope.messaging.showErrorMessage(data.errors[0].message,$scope.translate.load('sbi.generic.error'));
						return;
					}
	        		console.log("License Data:", data);
	        		$scope.hostsData=data.hosts;
	        		$scope.licenseData=data.licenses;
					$mdDialog.show({
						parent: parentEl,
						templateUrl: Sbi.config.contextName+'/themes/'+Sbi.config.currTheme+'/html/license.jsp',
						locals: {
							title : LN('sbi.home.License'),
							okMessage : LN('sbi.general.ok'),
							licenseData :  $scope.licenseData,
							config : Sbi.config,
							hosts: $scope.hostsData,
							translate : $scope.translate,
							messaging : $scope.messaging,
							download : $scope.download
						},
						controller: licenseDialogController
					});	
	        	}).
	        	error(function(error){
	        		$scope.showAlert('Attention, ' + "Error Calling REST service for Menu. Please check if the server or connection is working.")
	        	});
				
	        	function licenseDialogController(scope, $mdDialog, title, okMessage,licenseData, config, translate, messaging, download, hosts) {
	        			scope.title = title;
	        	        scope.okMessage = okMessage;
	        	        scope.licenseData = licenseData;
	        	        scope.config = config;
	        	        scope.translate = $scope.translate;
						scope.messaging = $scope.messaging;
						scope.download = $scope.download;
						scope.dialog = $mdDialog;
						scope.hosts = hosts;
	        	        
	        	        var restLicense = {
	        	        		base : scope.config.contextName + '/restful-services/1.0/license',
	        	        		download : '/download',
	        	        		upload : '/upload'
	        	        }
	        	        
	        	        scope.setFile = function (file){
	        	        	scope.file = file.files[0];
	        	        	scope.$apply();
	        	        }
	        	        
	        	        scope.uploadFile = function(hostName){
	        	        	if (scope.file){
	        	        		var config = {
	        	        				transformRequest:angular.identity,
	        	        				headers:{'Content-Type': undefined}
	        	        			};
	        	        		
	        	        		var formData = new FormData();
	        	        		formData.append(scope.file.name,scope.file);
	        	        		var currentHostName = hostName;
	        	        		$http.post(restLicense.base + restLicense.upload + "/"+hostName ,formData,config)
	        	        			.then(
	        	        				function(response,status,headers,config){
	        	        					if (response.data.errors){
	        	        						scope.messaging.showErrorMessage(scope.translate.load(response.data.errors[0].message),scope.translate.load('sbi.generic.error'));
	        	        					}else{
	        	        						// add the new license to the list
	        	        						$scope.licenseData[currentHostName].push(response.data);
	        	        						scope.file = undefined;
	        	        						scope.messaging.showInfoMessage(scope.translate.load('sbi.generic.resultMsg'),scope.translate.load('sbi.generic.info'));
	        	        					}
	        	        				},
	        	        				function(response,status,headers,config){
	        	        					if (response.data.errors){
	        	        						scope.messaging.showErrorMessage(response.data.errors[0].message,scope.translate.load('sbi.generic.error'));
	        	        					}else{
	        	        						scope.messaging.showErrorMessage(scope.translate.load('sbi.ds.failedToUpload'),scope.translate.load('sbi.generic.error'));
	        	        					}
	        	        				})
	        	        	}
	        	        }
	        	        
	        	        scope.dowloadFile = function(license, hostName){
	        	        	$http
	        	        		.get(restLicense.base + restLicense.download + '/' + hostName+ '/' + license.product)
	        	        		.then(
        	        				function(response,status,headers,config){	
        	        					if (response.data.errors){
        	        						scope.messaging.showErrorMessage(scope.translate.load(response.data.errors[0].message),scope.translate.load('sbi.generic.error'));
        	        					}else{
        	        						var paramsString = response.headers("Content-Disposition");
        	        						var arrayParam = paramsString.split(';');
        	        						var fileName = "";
        	        						var fileType = "";
        	        						var extensionFile = "";
        	        						for (var i = 0; i< arrayParam.length; i++){
        	        							var p = arrayParam[i].toLowerCase();
        	        							if (p.includes("filename")){
        	        								fileName = arrayParam[i].split("=")[1]; 
        	        							}else if (p.includes("filetype")){
        	        								fileType = arrayParam[i].split("=")[1];
        	        							}else if (p.includes("extensionfile")){
        	        								extensionFile = arrayParam[i].split("=")[1];
        	        							}
        	        						}
        	        						if (fileName && fileName.endsWith("." + extensionFile)){
        	        							fileName = fileName.split("." + extensionFile)[0];
        	        						}
        	        						scope.download.getBlob(response.data,fileName,fileType,extensionFile);
        	        						scope.messaging.showInfoMessage(scope.translate.load('sbi.generic.resultMsg'),scope.translate.load('sbi.generic.info'));
        	        					}
        	        				},
        	        				function(response,status,headers,config){
        	        					if (response.data.errors){
        	        						scope.messaging.showErrorMessage(response.data.errors[0].message,scope.translate.load('sbi.generic.error'));
        	        					}else{
        	        						scope.messaging.showErrorMessage(scope.translate.load('sbi.generic.genericError'),scope.translate.load('sbi.generic.error'));
        	        					}
        	        			});
	        	        }
	        	        
	        	        
	        	        
	        	        scope.deleteFile = function(license, hostName){
	        	        	
	        	        	var currentHostName = hostName;
	        	        	var urlToCall = restLicense.base + '/delete' + '/' + hostName +'/' + license.product;
	        	        	$http
	        	        		.get(urlToCall)
	        	        		.then(
        	        				function(response,status,headers,config){
        	        					if (response.data.errors){
        	        						scope.messaging.showErrorMessage(response.data.errors[0].message,scope.translate.load('sbi.generic.error'));
        	        					}else{
        	        						if(response.data.deleted == true){
        	        							var productD = response.data.product; 
        	        							var obj = $filter('filter')($scope.licenseData, {product: productD}, true)[0];

        	        							var index = $scope.licenseData[currentHostName].indexOf(obj);
        	        							$scope.licenseData[currentHostName].splice(index, 1);  
        	        							scope.file = undefined;
            	        						scope.messaging.showInfoMessage(scope.translate.load('sbi.generic.resultMsg'),scope.translate.load('sbi.generic.info'));
        	        						}
        	        						else {
        	        							scope.messaging.showErrorMessage(response.data.errors[0].message,scope.translate.load('sbi.generic.error'));
        	        						}
        	        					}
        	        				},
        	        				function(response,status,headers,config){
        	        					if (response.data.errors){
        	        						scope.messaging.showErrorMessage(response.data.errors[0].message,scope.translate.load('sbi.generic.error'));
        	        					}else{
        	        						scope.messaging.showErrorMessage(scope.translate.load('sbi.generic.genericError'),scope.translate.load('sbi.generic.error'));
        	        					}
        	        			});
	        	        }
	        	        
	        	        scope.closeDialog = function() {
	        	        	$http
        	        		.get(restLicense.base + '/checkLicensesDistributed')
        	        		.then(
    	        				function(response,status,headers,config){
    	        					if (response.data.errors){
    	        						scope.messaging.showErrorMessage(response.data.errors[0].message,scope.translate.load('sbi.generic.error'));
    	        					}else{
    	        						if(response.data.isDistributed == false){
    	        							scope.messaging.showErrorMessage(scope.translate.load('error.message.license.distributed'),scope.translate.load('sbi.generic.warning'));
    	        						}
    	        						$mdDialog.hide();
    	        					}
    	        				},
    	        				function(response,status,headers,config){
    	        					if (response.data.errors){
    	        						scope.messaging.showErrorMessage(response.data.errors[0].message,scope.translate.load('sbi.generic.error'));
    	        					}else{
    	        						scope.messaging.showErrorMessage(scope.translate.load('sbi.generic.genericError'),scope.translate.load('sbi.generic.error'));
    	        					}
    	        			});
	        	        	//$mdDialog.hide();
	        	        }
        	      }
			}
			
			$scope.callExternalApp = function callExternalApp(url){
				if (!Sbi.config.isSSOEnabled) {
					if (url.indexOf("?") == -1) {
						url += '?<%= SsoServiceInterface.USER_ID %>=' + Sbi.user.userUniqueIdentifier;
					} else {
						url += '&<%= SsoServiceInterface.USER_ID %>=' + Sbi.user.userUniqueIdentifier;
					}
				}
				
				$scope.redirectIframe(url);
			}
			
			$scope.goHome = function goHome(html){
				var url;
				if(!html){
					url = firstUrlTocallvar;
				}else{
					url = Sbi.config.contextName+'/themes/'+Sbi.config.currTheme+html;
				}
				if(url){
					$scope.redirectIframe(url);
				}
			}
			
			$scope.languageSelection = function languageSelection(){
        		$scope.toggleMenu();
        		
	 			var languages = [];

    	 		for (var j = 0; j < Sbi.config.supportedLocales.length ; j++) {
    	 			var aLocale = Sbi.config.supportedLocales[j];
     				var languageItem = {
    					text: aLocale.language,
    					iconCls:'icon-' + aLocale.language,
    					href: $scope.getLanguageUrl(aLocale),
    					linkType: 'execUrl'
    				};
     				languages.push(languageItem);
    	 		}
    	 		
    	 		var languageTemplate;
    	 		for (var i = 0; i < languages.length; i++){
    	 			if (languageTemplate != undefined){
    	 				languageTemplate = languageTemplate + languages[i].text +"<br/>";
    	 			} else {
    	 				languageTemplate = languages[i].text +"<br/>";
    	 			}
    	 		}
        		
    	 		$scope.languages = languages;
        		
    	 		$scope.showDialog();
				//$scope.showAlert("Select Language",languageTemplate)
			}
			
			$scope.getLanguageUrl = function getLanguageUrl(config){
				var languageUrl = Sbi.config.contextName+"/servlet/AdapterHTTP?ACTION_NAME=CHANGE_LANGUAGE&LANGUAGE_ID="+config.language+"&COUNTRY_ID="+config.country+"&THEME_NAME="+Sbi.config.currTheme;
				return languageUrl;
			}
			
			$scope.accessibilitySettings = function (){
				
				console.log("IN ACCESSIBILITY SETTINGS");
				$scope.toggleMenu();
				$scope.showAccessibilityDialog();
			}
			
			$scope.showAccessibilityDialog= function(){
			      var parentEl = angular.element(document.body);
       	       $mdDialog.show({
       	         parent: parentEl,
       	         templateUrl: Sbi.config.contextName+"/js/src/angular_1.4/menu/templates/accessibilityDialogTemplate.html",
       	         locals: {
       	          
       	         }
       	         ,controller: AccessibilityDialogController
       	      });
       	       
       	      function AccessibilityDialogController(scope, $mdDialog, $window,sbiModule_translate) {
       	    	  scope.translate = sbiModule_translate;
       	    	scope.enableAccessibility = enableUIO;
       	    	
       	        scope.saveAccessibilityPreferences = function(){
       	        	var preferencesObj={
       	        		id:null,
       	        		user:null,
       	        		enableUio:scope.enableAccessibility,
       	        		enableRobobraille: scope.enableAccessibility,
       	        		enableVoice: scope.enableAccessibility,
       	        		enableGraphSonification:scope.enableAccessibility,
       	        		preferences:null
       	        	};
       				sbiModule_restServices.promisePost('2.0/preferences','',preferencesObj)
       				.then(function(response) {
       			         console.log(response);
       			      sbiModule_messaging.showSuccessMessage("preferences saved successfuly", 'Success');
       			        enableUIO=scope.enableUIO;
             	        enableRobobraille= scope.enableRobobraille;
             	    	enableVoice= scope.enableVoice;
             	    	enableGraphSonification= scope.enableGraphSonification;
       			        
             	    	sbiModule_messaging.showSuccessMessage("Preferences saved successfuly", 'Successs');
             	    	$window.location.reload();
       				}, function(response) {
       					sbiModule_messaging.showErrorMessage(response, 'Error');
       					
       				});	
       	        	
       	        }
       	        scope.closeDialog = function() {
       	          $mdDialog.hide();
       	        }
       	        scope.menuCall=$scope.menuCall;
       	      }
				
			}
			
			$scope.resetSessionObjects = function() {
				try {
					var STORE_NAME = sbiModule_config.sessionParametersStoreName;
					var PARAMETER_STATE_OBJECT_KEY = sbiModule_config.sessionParametersStateKey; 
					
					var store = new Persist.Store(STORE_NAME, {
						swf_path: sbiModule_config.contextName + '/js/lib/persist-0.1.0/persist.swf'
						});

					//if (sbiModule_config.isStatePersistenceEnabled) {
						store.set(PARAMETER_STATE_OBJECT_KEY, angular.toJson({}));
					//}
					
				} catch (err) {
					console.error("Error in deleting parameters data from session");
				}
			}
			
			
			
			$scope.menuCall = function menuCall(url,type){
				if (type == 'execDirectUrl'){
					//custom fix to launch datasets in a new page. Please change after angular version is on
					if(url=='/knowage/servlet/AdapterHTTP?ACTION_NAME=MANAGE_DATASETS_ACTION&LIGHT_NAVIGATOR_RESET_INSERT=TRUE' && $scope.testIe11()){
						$scope.externalUrl(url)
					}else{
						$scope.redirectIframe(url);
					}
					
				}else if(type == "dialog"){
					$scope.openDialog(url);
				} else if (type == 'roleSelection'){
					$scope.roleSelection();
				} else if (type =="execUrl"){
					
					// if it s logout clean parameters cached in session
					if(url.indexOf("LOGOUT_ACTION") !== -1){   
						$scope.resetSessionObjects();
					}
					
					$scope.execUrl(url);
				} else if (type == "externalUrl"){
					$scope.externalUrl(url)
				} else if (type == "info"){
					$scope.info();
				} else if (type == "callExternalApp"){
					$scope.callExternalApp(url);
				} else if (type == "goHome"){
					$scope.goHome(url);
				} else if (type == "languageSelection"){
					$scope.languageSelection();
				} else if (type == "accessibilitySettings"){
					$scope.accessibilitySettings();
				}
			}
        }
    };
}]);
