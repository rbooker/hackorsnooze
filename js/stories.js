"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */
// Added the boolean argument canDelete after realizing that only stories that the user
// submitted can be deleted. It would've been useful to explain that in the instructions,
// if anyone from Springboard actually reads this (they won't).
function generateStoryMarkup(story, canDelete) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();

  //if the user is logged in, show the favorite/unfavorite icon
  const showFaves = currentUser ? true : false;
  //if the story was submitted by the logged-in user, show the trash-can icon next to it
  const showDelete = canDelete ? true : false;

  //the li that contains all the story details and the favorite and trash-can icons, depending
  return $(`
      <li id="${story.storyId}">
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        ${showFaves ? makeFaveIcon(story, currentUser) : ""}
        ${showDelete ? makeDeleteButton() : ""}
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

//makes a delete button (a trash can) using an icon from fontawesome.com
function makeDeleteButton() {
  return `<span class="trash-can">
          <i class="fas fa-trash-alt"></i>
          </span>`;
}

//makes a favorite/unfavorite button (grin/meh faces) using icons from fontawesome.com
function makeFaveIcon(story, user) {
  const isFavorite = user.isFavorite(story);
  const faceType = isFavorite ? "grin" : "meh";
  return `
      <span class="face">
        <i class="fas fa-${faceType}"></i>
      </span>`;
}
/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story, false);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

//The function that handles submitting a new story - invoked by pressing the submit button
//on the submission form (is saying submit button on submission form redundant?)
async function submitStory(evt) {
  console.debug("submitStory");
  evt.preventDefault();

  //gets author/title/url data from the form
  const submissionAuthor = $("#submit-author").val();
  const submissionTitle = $("#submit-title").val();
  const submissionURL = $("#submit-url").val();
  
  //makes a POJO to use in submitting the story
  const newStoryData = {author: submissionAuthor,
                        title: submissionTitle, 
                        url: submissionURL, 
                        username: currentUser.username};

  //submit the story, get Story object
  const newStory = await storyList.addStory(currentUser, newStoryData);

  //generates the HTML markup and puts the Story object in the list of all stories
  const $newStory = generateStoryMarkup(newStory, false);
  $allStoriesList.prepend($newStory);

  //fade out submit form and clear the fields
  $submitForm.fadeOut();
  $submitForm.trigger("reset");
}

$submitForm.on("submit", submitStory);

//Allows a user to delete stories they've submitted (again - wish I knew that only user-submitted
//stories could be deleted beforehand). Invoked by clicking the trash can icon next to the story.
async function deleteStory(evt) {
  console.debug("deleteStory");

  //select the closest LI and get the story ID
  const $closestLI = $(evt.target).closest("li");
  const storyID = $closestLI.attr("id");

  //remove the story from the system
  await storyList.removeStory(currentUser, storyID);

  //reload list of stories
  await putStoriesOnPage();
}

$ownStories.on("click", ".trash-can", deleteStory);

//Shows the user's own submitted stories. Not much to it. Just checks the currentUser.ownStories
//variable and if there's anything in it, puts the Story objects on the page - the only real
//difference between this and the other "show story" functions being that it puts the delete
//icon (trash can) next to the stories.
function showUserStories() {
  console.debug("showUserStories");

  //Empty the list of stories first. Otherwise it'll keep adding the same ones over and over
  $ownStories.empty();

  //If the user hasn't submitted any stories, display a message saying so.
  if (currentUser.ownStories.length === 0) {
    $ownStories.append("<h3>No stories added by user yet!</h3>");
  } 
  //Otherwise, fill the list up with user-generated stories - these ones get the little garbage can
  //icon next to them, too.
  else {
    for (let story of currentUser.ownStories) {
      let $story = generateStoryMarkup(story, true);
      $ownStories.append($story);
    }
  }

  //Finally, show the section
  $ownStories.show();
}

//Shows the user's favorited stories. Not much to it. Just checks the currentUser.favorites
//variable and if there's anything in it, puts the Story objects on the page
function showFavoriteStories() {
  console.debug("showFavoriteStories");
  //Empty the list of stories first. Otherwise it'll keep adding the same ones over and over
  $favoritedStories.empty();

  //If the user hasn't favorited any stories, display a message saying so.
  if (currentUser.favorites.length === 0) {
    $favoritedStories.append("<h3>No favorites added!</h3>");
  } 
  //Otherwise, fill the list up with favorited stories
  else {
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story, false);
      $favoritedStories.append($story);
    }
  }
  //Finally, show the section
  $favoritedStories.show();
}

//A function to handle favoriting/unfavoriting stories. Invoked when the "favorite" icon, i.e.
//the smiley/meh face is clicked
async function faveUnfaveStory(evt) {
  console.debug("faveUnfaveStory");

  //Get the story targeted by the click
  const $storyTargeted = $(evt.target);
  const $closestLI = $storyTargeted.closest("li");
  //Get the story ID
  const storyID = $closestLI.attr("id");
  //Find the story in the list of all stories
  const storyTargeted = storyList.stories.find(st => st.storyId === storyID);

  //If it has a "grin", i.e. it's been favorited, remove it from the list of favorites, both locally
  //and in the system and toggle the class from "fa-grin" to "fa-meh"
  if ($storyTargeted.hasClass("fa-grin")) {
    
    await currentUser.removeFavorite(storyTargeted);
    $storyTargeted.closest("i").toggleClass("fa-grin fa-meh");

  } 
  //Otherwise, add it to the list of favorites, both locally and in the system and toggle the class
  //from "fa-meh" to "fa-grin"
  else {
    
    await currentUser.addFavorite(storyTargeted);
    $storyTargeted.closest("i").toggleClass("fa-meh fa-grin");

  }

}

$storiesLists.on("click", ".face", faveUnfaveStory);


