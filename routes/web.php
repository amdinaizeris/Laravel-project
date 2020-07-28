<?php



Route::get('/', function () {
    return view('game');
});

Auth::routes();

Route::get('/leaders', 'LeaderboardController@index')->name('home');

Route::post('/game/complete', 'GameController@complete');
