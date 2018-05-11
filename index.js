'use strict';

const STORE = {
    items: [
        {
            name: "apples", 
            checked: false,
            createdAt: new Date(Date.now() - 1000000) 
        },
        {
            name: "oranges", 
            checked: false,
            createdAt: new Date(Date.now() - 4000000) 
        },
        {
            name: "milk", 
            checked: true,
            createdAt: new Date(Date.now() - 2000000)
        },
        {
            name: "bread", 
            checked: false,
            createdAt: new Date(Date.now() - 3000000) 
        }
    ],
    sort: 'alpha'
}

function getTimeString(time) {
    return time.toLocaleString('en-US');
}

function generateItemElement(item, itemIndex, template) {
  return `
    <li class="js-item-index-element" data-item-index="${itemIndex}">
      <span class="shopping-item js-shopping-item ${item.checked ? "shopping-item__checked" : ''}">${item.name}</span>
      <span class="timestamp">${getTimeString(item.createdAt)}</span>
      <div class="shopping-item-controls">
        <button class="shopping-item-toggle js-item-toggle">
            <span class="button-label">check</span>
        </button>
        <button class="shopping-item-delete js-item-delete">
            <span class="button-label">delete</span>
        </button>
        <button class="shopping-item-edit js-item-edit">
            <span class="button-label">edit</span>
        </button>
      </div>
    </li>`;
}


function generateShoppingItemsString(shoppingList) {
  console.log("Generating shopping list element");

  const items = shoppingList.map((item, index) => generateItemElement(item, index));
  
  return items.join("");
}


function renderShoppingList() {
  // render the shopping list in the DOM
  console.log('`renderShoppingList` ran');
  const shoppingListItemsString = generateShoppingItemsString(STORE.items);
  // insert that HTML into the DOM
  $('.js-shopping-list').html(shoppingListItemsString);
}


function addItemToShoppingList(itemName) {
  console.log(`Adding "${itemName}" to shopping list`);
  STORE.items.push({name: itemName, checked: false, createdAt: new Date(Date.now())});
}

function handleNewItemSubmit() {
  $('#js-shopping-list-form').submit(function(event) {
    event.preventDefault();
    console.log('`handleNewItemSubmit` ran');
    const newItemName = $('.js-shopping-list-entry').val();
    $('.js-shopping-list-entry').val('');
    addItemToShoppingList(newItemName);
    renderShoppingList();
  });
}

function toggleCheckedForListItem(itemIndex) {
  console.log("Toggling checked property for item at index " + itemIndex);
  STORE.items[itemIndex].checked = !STORE.items[itemIndex].checked;
}


function getItemIndexFromElement(item) {
  const itemIndexString = $(item)
    .closest('.js-item-index-element')
    .attr('data-item-index');
  return parseInt(itemIndexString, 10);
}

function handleItemCheckClicked() {
  $('.js-shopping-list').on('click', `.js-item-toggle`, event => {
    console.log('`handleItemCheckClicked` ran');
    const itemIndex = getItemIndexFromElement(event.currentTarget);
    toggleCheckedForListItem(itemIndex);
    renderShoppingList();
  });
}

// name says it all. responsible for deleting a list item.
function deleteListItem(itemIndex) {
  console.log(`Deleting item at index  ${itemIndex} from shopping list`)

  // as with `addItemToShoppingLIst`, this function also has the side effect of
  // mutating the global STORE value.
  //
  // we call `.splice` at the index of the list item we want to remove, with a length
  // of 1. this has the effect of removing the desired item, and shifting all of the
  // elements to the right of `itemIndex` (if any) over one place to the left, so we
  // don't have an empty space in our list.
  STORE.items.splice(itemIndex, 1);
}


function handleDeleteItemClicked() {
  // like in `handleItemCheckClicked`, we use event delegation
  $('.js-shopping-list').on('click', '.js-item-delete', event => {
    // get the index of the item in STORE
    const itemIndex = getItemIndexFromElement(event.currentTarget);
    // delete the item
    deleteListItem(itemIndex);
    // render the updated shopping list
    renderShoppingList();
  });
}

function handleSortBy() {
    $('#sort-by').on('change', function(event) {
        const sortBy = $(event.currentTarget).find(':selected').val();
        renderSortedList(sortBy);
    })
}

function handleCheckedSort() {
    const items = [...STORE.items];
    let newList = [];
    $('#checked').on('change', function(event) {
        if (this.checked) {
            newList = items.filter(item => item.checked === true)
        } else if (!this.checked) {
            newList = items.filter(item => item.checked === false);
        }
        const shoppingListItemsString = generateShoppingItemsString(newList);
        $('.js-shopping-list').html(shoppingListItemsString);
    })
}

function renderSortedList(sort) {
    const sortedList = [...STORE.items];
    if (sort == 'alpha') {
        sortedList.sort( (a, b) => {
            let nameA = a.name.toUpperCase();
            let nameB = b.name.toUpperCase();
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
            return 0;
        })
    } else if (sort == 'date') {
        sortedList.sort( (a, b) => {
            return a.createdAt - b.createdAt;
        })
    }
    const shoppingListItemsString = generateShoppingItemsString(sortedList);

    $('.js-shopping-list').html(shoppingListItemsString);
}

function handleSearch() {
    const searchTerm = $('#search').on('input', function(event) {
        filterByName(searchTerm.val());
    })
}

function filterByName(term) {
    const items = [...STORE.items];
    let results = [];
    if (term.length > 3) {
        results = items.filter((el) =>
        el.name.toLowerCase().indexOf(term.toLowerCase()) > -1
      );
    } else if (term.length === 0) {
        handleShoppingList();
    }
    const shoppingListItemsString = generateShoppingItemsString(results);

    $('.js-shopping-list').html(shoppingListItemsString);
}

//on click create an input
//type into input
//that will change the store.name
//call re-render the list

function handleChangingName() {
    $('.shopping-item-edit').on('click', function() {
        $(this).parent('div').append(
            `<form id="new-name-form"><input type="text" id="new-name" placeholder="new name (hit enter)"></form>`
        )
        $('#new-name-form').on('submit', function(event) {
            event.preventDefault();
            let name = $("#new-name").val()
            let index = getItemIndexFromElement(event.currentTarget);
            changeName(name, index);
        })
    })
}

function changeName(name, index) {
    STORE.items[index].name = name;
    const shoppingListItemsString = generateShoppingItemsString(STORE.items);

    $('.js-shopping-list').html(shoppingListItemsString);
    handleChangingName();
}


// this function will be our callback when the page loads. it's responsible for
// initially rendering the shopping list, and activating our individual functions
// that handle new item submission and user clicks on the "check" and "delete" buttons
// for individual shopping list items.
function handleShoppingList() {
  renderShoppingList();
  handleNewItemSubmit();
  handleItemCheckClicked();
  handleDeleteItemClicked();
  handleSortBy();
  handleCheckedSort();
  handleSearch();
  handleChangingName();
}

// when the page loads, call `handleShoppingList`
$(handleShoppingList);