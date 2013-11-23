$('td > input[name="merge"]:not(:disabled)').after([
	' ',
	$('<input type="submit" class="button" name="merge" value="Merge All">').
		click(function (event) {
			$(this).closest('form').append([
				$('<input type="hidden" name="confirm">'),
				$('<input type="hidden" name="mgt_order_done">')
			]);
		})
]);

$('td > input[name="loadarmies"]:not(:disabled)').after([
	' ',
	$('<input type="submit" class="button" name="randomLoadAll" value="Load All">')
]);

Hyperiums7.getPlanetInfo().done(function (planets) {
	var cash = parseFloat($('#cashTab').text().replace(/,/g, '')) || 0;
	$('[name="build"]').after($('<p class="totals">'));
	$('[name="buildunits"]').
		attr({
			type: 'number',
			min: 0
		}).
		keydown(function (event) {
			if (event.which == 13) {
				event.preventDefault();
				$(this).siblings('[name="build"]').click();
			}
		}).
		add('[name="unittype"]').
		on('input change keyup', function () {
			var form = $(this).closest('form'),
				planetId = parseInt(form.find('[name="planetid"]').val()) || 0,
				totals = Hyperiums7.getBuildPipeTotals([{
					count: parseFloat(form.find('[name="buildunits"]').val()) || 0,
					unitId: parseInt(form.find('[name="unittype"]').val()) || 0
				}], planets.ids[planetId]),
				buildCostSpan;

			form.find('.totals').empty().append([
				'<strong>Space AvgP:</strong> ',
				numeral(totals.spaceAveragePower).format('0[.]0a'),
				' - <strong>Build Costs:</strong> ',
				buildCostSpan = $('<span>').text(numeral(totals.buildCosts).format('0[.]0a')),
				' - <strong>Upkeep Costs:</strong> ',
				numeral(totals.upkeepCosts).format('0[.]0a'),
				' - <strong>Time to build:</strong> ',
				moment.duration(Math.ceil(totals.timeToBuild) * 3600000).format()
			]);

			if (totals.buildCosts > cash) {
				buildCostSpan.addClass('alertLight');
			}
		});
});

$('.movingFleetGroupTitle + tr img[src$="fleetarmy_icon.gif"]').
	each(function (_, element) {
		var numCarriedArmies = parseFloat(
				element.previousSibling.nodeValue.replace(/[^\d]+/g, '')
			),
			raceName = element.parentNode.firstChild.getAttribute('src').
				replace(/^.*?([a-z]+)\.gif$/i, '$1'),
			raceId = Hyperiums7.races.indexOf(raceName),
			averagePower = Hyperiums7.groundAveragePower[raceId] * numCarriedArmies;

		$(element).closest('tr').prev().find('td:first-child').append([
			' - Ground AvgP: ',
			$('<b>').text(
				numeral(averagePower).format('0[.]0a')
			)
		]);
	});

$('[name="destplanetname"], [name="toplanet"], [name="destname"]').
	autocomplete({
		autoFocus: true,
		source: function (request, sendResponse) {
			Hyperiums7.searchPlanets(request.term).
				done(function (planets) {
					var names = [];
					$.each(planets, function (_, planet) {
						names.push(planet.name);
					});
					sendResponse(names);
				}).
				fail(function () {
					sendResponse([]);
				});
		}
	});

