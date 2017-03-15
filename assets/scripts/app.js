'use strict';

(function(window, document, angular, undefined) {

	angular
		.module('CorreiosSearchApp', [])
		.value('CONFIG', {
			POSTMON: 'https://api.postmon.com.br/v1/',
			MAPS: 'https://www.google.com/maps/embed/v1/place?key=AIzaSyC0-boVQJsAlJUs6Xbvqa7i-dXHHcfx8Hw&q='
		})
		.config(function($sceProvider) {
			$sceProvider.enabled(false);
		})
		.service('Correios', function($http, CONFIG) {

			function cepResponse(response) {

				return {
					status: response.status,
					cep: response.data.cep || null,
					state: response.data.estado_info.nome || response.data.estado || null,
					city: response.data.cidade || null,
					neighborhood: response.data.bairro || null,
					address: response.data.logradouro || response.data.endereço || null,
					complement: response.data.complemento || null
				};

			}

			function cep(code) {

				return $http.get(CONFIG.POSTMON + 'cep/' + code)
					.then((response) => cepResponse(response), (response) => cepResponse(response));

			}

			function shipmentResponse(response) {

				let history = [];

				angular.forEach(response.data.historico, (value, key) => {

					history.push({
						date: value.data || null,
						situation: value.situacao || null,
						details: value.detalhes || null,
						local: value.local || null
					});

				});

				return {
					status: response.status,
					trakingCode: response.data.codigo,
					history: history,
				};

			}

			function shipment(code) {

				return $http.get(CONFIG.POSTMON + 'rastreio/ect/' + code)
					.then((response) => shipmentResponse(response), (response) => shipmentResponse(response));

			}

			function search(code) {

				code = code.replace('-', '');

				if (code.length === 8) {
					return cep(code);
				} else if (code.length === 13) {
					return shipment(code);
				}

			}

			return {
				cep: cep,
				shipment: shipment,
				search: search
			};

		})
		.controller('SearchController', ($scope, CONFIG, Correios) => {

			$scope.result = null;
			$scope.buttonText = 'Pesquisar';

			function searching(status) {

				$scope.searching = status;

				if (status) {
					$scope.buttonText = 'Pesquisando...';
				} else {
					$scope.buttonText = 'Pesquisar';
				}

			}

			function getAddressMap(address) {

				console.log('getAddressString', address);

				return `${ CONFIG.MAPS }${ address.address } ${ address.neighborhood } ${ address.city } ${ address.state} `
					.replace(/null/g, '')
					.trim();

			}

			function doSearch(searchTerm) {

				if (searchTerm.length < 8 || searchTerm.length > 13) {
					return alert('Informe um CEP ou código de rastreio correto');
				}

				searching(true);

				Correios.search(searchTerm).then((response) => {

					if (response.status === 200) {

						$scope.result = response;
						$scope.result.map = getAddressMap(response);

					}

					searching(false);

				}, (response) => {

					searching(false);

				});

			}

			$scope.doSearch = doSearch;

		});

}(window, document, angular));
