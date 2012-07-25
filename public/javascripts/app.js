(function($){  
    $(function(){

        $(document).foundationAlerts();
        $(document).foundationAccordion();
        $(document).tooltips();
        $('input, textarea').placeholder();



        $(document).foundationButtons();



        $(document).foundationNavigation();



        $(document).foundationCustomForms();

        $(document).foundationTabs({callback:$.foundation.customForms.appendCustomMarkup});

        $(document).keyup(function(e){
            if(e.keyCode == 13) {
                $('#profid').removeClass('error');
                $('#search').click();
            }
        });
        Trello.authorize({
            interactive: false,
            success: null
        });
        window.connectedToTrello = Trello.authorized();

        var clickAddTrello = function() {
            connectedToTrello = true;
            $('#clickAddTrello').reveal();
        }

        var addCard = function(el) {
            $('.selectBoard').html('');
            $('.selectList').html('');
            $('.selectList').hide();
            $('#add').removeClass('disabled');
            $('#add').hide();
            Trello.get('members/me/boards', function(boards) { 
                console.log(boards);
                for( board in boards) {
                    if(!boards[board].closed) {
                        $('.selectBoard').append('<option data-id="'+boards[board].id+'" class="board-'+boards[board].name+'">'+boards[board].name+'</option>');
                    }
                }
                $('#realAdd').reveal();
                $('.selectBoard').change(function() {
                    $('#add').hide();
                    Trello.get('boards/'+($('.board-'+($('.selectBoard').val())).data('id')  )+'/lists', function(lists) {
                        $('.selectList').html('');
                        for(list in lists) {
                            $('.selectList').append('<option data-id="'+lists[list].id+'" class="list-'+(lists[list].name.split(" "))[0]+'">'+lists[list].name+'</option>');
                        }
                        $('.selectList').show();
                        $('.selectList').change(function() {
                            $('#add').show();
                            $('#add').click(function() {
                                if(!$(this).hasClass('disabled')) {
                                    $(this).addClass('disabled');

                                    cardData = {};
                                    IN.API.Profile($(el).data('id'))
                                        .fields(['firstName', 'lastName', 'headline', 'three-current-positions', 'publicProfileUrl'])
                                        .result(function( person ) {
                                            person = person.values[0];
                                            console.log(person); 
                                            description = '';
                                            description += '#'+person.headline+'\n\n';
                                            description += '**Profile Url**: '+person.publicProfileUrl+'\n\n';
                                            if (person.threeCurrentPositions){
                                                for(pos in person.threeCurrentPositions.values) {
                                                    description += '**Position**: '+person.threeCurrentPositions.values[pos].title+' at '+person.threeCurrentPositions.values[pos].company.name+'\n\n';
                                                }
                                            }
                                            cardData.name = person.firstName + ' ' + person.lastName;
                                            cardData.desc = description;
                                            cardData.idList = $('.list-'+(($('.selectList').val()).split(" "))[0]).data('id');
                                            console.log(cardData);
                                            Trello.post('cards', cardData, function (err, card) {
                                                if(err) {
                                                    console.log(err);
                                                }
                                                console.log(card);
                                            });

                                        });
                                }
                            });
                        });
                    });
                });
            });
        }


        $('#search').click(function(){
            var profid = $('#profid').val();
            if(profid == "") {
                $('#profid').addClass('error');
            } else {
                var params = {};
                var ext = profid.split(' ');
                params['first-name'] = ext[0];
                if(ext.length > 1) {
                    params['last-name'] = ext[1];
                } 
                console.log(params);
                IN.API.PeopleSearch()
                    .fields(['firstName','lastName', 'id', 'publicProfileUrl', 'pictureUrl'])
                    .params(params)
                    .result(function(result){ 
                    $('.profiles').html('');
                    console.log(result);
                    console.log(result.people.values);
                    for(index in result.people.values) {
                        var person = result.people.values[index];
                        console.log(person);
                        if(person.pictureUrl === undefined) {
                            person.pictureUrl = 'https://www.linkedin.com/scds/common/u/img/icon/icon_no_photo_80x80.png'
                        }
                        var profile = '<div class="panel">';
                        profile += '<div class="row">';
                            profile += '<div class="two columns">';
                                profile += '<img src="'+person.pictureUrl+'" />';
                            profile += '</div>';
                            profile += '<div class="ten columns">';
                                profile += '<a href="'+person.publicProfileUrl+'"><h2>'+person.firstName+' '+person.lastName+'</h2></a>';
                            profile += '</div>';
                        profile += '</div>';
                        profile += '<div class="row">';
                            profile += '<div class="nine columns"></div>'
                            profile += '<div class="three columns">';
                                profile += '<a class="button addTrello" data-id="'+person.id+'">Add to Trello</a>';
                            profile += '</div>';
                        profile += '</div>';
                        $('.profiles').append(profile);
                    }
                    $('.addTrello').click(function(e) {
                        if(!$(this).hasClass('disabled')) {
                            $(this).addClass('disabled');
                            if(connectedToTrello) {
                                // present options and add card to trello
                                addCard(this);
                            } else {
                                Trello.authorize({
                                    type: 'popup',
                                    scope: { write: true, read: true },
                                    success: clickAddTrello
                                });
                                $(this).removeClass('disabled');
                            }
                        }
                    });
                });
            }
        });
    });

})(jQuery);
