import { SVGs, sectionPages, itemDetailsAddon } from "./variables.js";

const main = document.querySelector(".kb-whole")

// Hero elements
const heroTitle = document.getElementById("hero-title");
const heroDesc = document.getElementById("hero-description");
const heroImg = document.getElementById("hero-image");

// Section element
const bodySecs = document.getElementById("kb-sections");

// Search elements
const searchForm = document.querySelector('.search-bar');
const searchInput = document.querySelector('input[name="search"]');

let bodyElement = document.body;

let generatedSections = "";
let sectionItems = {};
let searchItems = [];

const ButterCMS = Butter('34400529ef3f9d2dbb968fb4406b48ede1891b06');

// Code to be executed when the DOM content has finished loading
document.addEventListener('DOMContentLoaded', function (event) {
  // Initialize Butter API with READ API token
  const params = {
    'preview': 1
  }

  ButterCMS.page.retrieve('kb_homepage', 'javascript-knowledge-base', params)
    .then(function (resp) {
      const { data } = resp.data;

      heroTitle.innerText = data.fields["hero_section"].title;
      heroDesc.innerText = data.fields["hero_section"].description;
      heroImg.src = data.fields["hero_section"]["img_url"];

      data.fields.sections.forEach((val) => {
        let className = val.title.toLowerCase().replace(/\s+/g, '-')
        let section =
          `<div class="${className}">
            <div class="icons-div"> ${className == "faqs" ? SVGs[2] : className == "popular-articles" ? SVGs[1] : SVGs[0]}
            </div>
            <p class="section-heading">${val.title}</p>
            <p class="section-description">${val.description}</p>
           </div>`;

        generatedSections += section;
      });

      bodySecs.innerHTML = generatedSections;

      // Collection section items.
      data.fields.sections.forEach((val) => {
        sectionItems[val.title] = [...val.items]
        searchItems = searchItems.concat(val.items);
      });

      // spinner.style.display = "none";
      main.style.display = "block"

    })
    .catch(function (resp) {
      console.log(resp)
    });
});


bodySecs.addEventListener("click", function (e) {
  // Traverse up the parent tree
  let currentElement = e.target;
  while (currentElement.parentNode !== null) {
    if (currentElement.className == "kb-sections") {
      return
    }

    if (currentElement.className == "getting-started") {
      bodyElement.innerHTML = "";
      bodyElement.innerHTML = fillSection(currentElement.className);
      return
    }

    if (currentElement.className == "popular-articles") {
      bodyElement.innerHTML = "";
      bodyElement.innerHTML = fillSection(currentElement.className);
      return
    }

    if (currentElement.className == "faqs") {
      bodyElement.innerHTML = "";
      bodyElement.innerHTML = fillSection(currentElement.className);
      return
    }

    currentElement = currentElement.parentNode;
  }
});

function fillSection(sectionName) {
  let items = innerList(sectionName);

  let contentItems = "";

  items.forEach((val) => {
    let className = val.title.toLowerCase().replace(/\s+/g, '-')

    let items = `
        <li class="${className} ${sectionName + "_"}">
          <h3>${val.title}</h3>
        </li>
    `;

    contentItems += items;
  })

  let section = `
  <section class="faq-section">
    <h2>${sectionPages[sectionName].h2}</h2>
    <p class="section-des">${sectionPages[sectionName].desc}</p>
    <div class="faq-list">
      <ul>
  ` + contentItems + `</ul>
  </div>
</section>`;

  return section;
}

function innerList(fieldName) {
  if (fieldName == "getting-started") {
    return sectionItems["Getting Started"]
  } else if (fieldName == "popular-articles") {
    return sectionItems["Popular Articles"]
  } else {
    return sectionItems["FAQs"]
  }
}


// Article
bodyElement.addEventListener("click", function (e) {
  // Traverse up the parent tree
  let currentElement = e.target;
  while (currentElement.parentNode !== null) {
    if (currentElement.className == "faq-list") {
      return
    }

    let classList = Array.from(currentElement.classList);

    if (classList.includes("getting-started_")) {
      bodyElement.innerHTML = "";
      bodyElement.innerHTML = fillItemDetails(classList[0], "getting-started") + itemDetailsAddon;
      return;
    }
    if (classList.includes("popular-articles_")) {
      bodyElement.innerHTML = "";
      bodyElement.innerHTML = fillItemDetails(classList[0], "popular-articles") + itemDetailsAddon;
      return;
    }
    if (classList.includes("faqs_")) {
      bodyElement.innerHTML = "";
      bodyElement.innerHTML = fillItemDetails(classList[0], "faqs") + itemDetailsAddon;
      return
    }

    currentElement = currentElement.parentNode;
  }
});

function fillItemDetails(actualClassName, sectionName) {
  let items = innerList(sectionName);
  let template;

  items.forEach((val) => {
    let expectedClassName = val.title.toLowerCase().replace(/\s+/g, '-')

    if (expectedClassName == actualClassName) {
      template = `
        <div class="faq">
          <h2>${val.title}</h2>
          <p class="section-detail">${val.description}</p>
        </div>
      `;
    }
  })

  return template;
}



// Add event listener to search form submit
searchForm.addEventListener('submit', function (event) {
  event.preventDefault();
  const searchQuery = searchInput.value.trim().toLowerCase();

  let result = "";

  let sections = ["popular-articles", "getting-started", "faqs",];

  sections.forEach((item) => {
    result += search(searchQuery, item);
  });

  let searchResult = `
  <section class="faq-section">
    <div class="faq-list">
      <ul>
  ` + result + `</ul>
  </div>
</section>`;

  bodySecs.innerHTML = searchResult;
});

/**
 * Performs a search within the specified
 * section items.
 */
function search(query, sectionName) {
  let items = innerList(sectionName);
  let template = "";

  console.log(items);

  items.forEach((val) => {
    let title = val.title.toLowerCase();

    if (title.toLowerCase().includes(query)) {
      let tmp = `
        <li class="${title.replace(/\s+/g, '-')} ${sectionName + "_"}">
          <h3>${val.title}</h3>
          <sub>${sectionName.split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')}</sub>
        </li>
    `;

      template += tmp;
    }
  });

  return template;
}

// Add event listener to reset search on click anywhere on the page
document.addEventListener('click', function (event) {
  const target = event.target;

  // Check if the click is outside the search form or search results
  if (!searchForm.contains(target)) {
    resetSearch();
  }
});

// resetSearch resets search input
function resetSearch() {
  bodySecs.innerHTML = generatedSections
}


