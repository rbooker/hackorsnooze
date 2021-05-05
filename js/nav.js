"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

//Show the submit story form when the user clicks on that part of the navbar
function navSubmitStoryClick(evt) {
  console.debug("navSubmitStoryClick", evt);
  //Hide the page components
  hidePageComponents();
  //Show the list of stories and the submit form
  $allStoriesList.show();
  $submitForm.show();
}

$navSubmitStory.on("click", navSubmitStoryClick);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

//Show favorited stories when that part of the navbar is clicked
function navFavoritesClick(evt) {
  console.debug("navFavoritesClick", evt);
  hidePageComponents();
  showFavoriteStories();
}

$body.on("click", "#nav-favorites", navFavoritesClick);

//Show the user's stories when that part of the navbar is clicked
function navMyStories(evt) {
  console.debug("navMyStories", evt);
  hidePageComponents();
  showUserStories();
  $ownStories.show();
}

$body.on("click", "#nav-my-stories", navMyStories);
