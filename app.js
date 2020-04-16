// nodes
const episodeList = document.querySelector("#episode-list");
const showDetail = document.querySelector("#show-detail");
const showList = document.querySelector("#show-list");
const searchForm = document.forms["search-form"];
const submitButton = searchForm.elements.submit;
const query = searchForm.elements.query;

// api
const baseurl = "https://api.tvmaze.com";

// suscribe to listeners
searchForm.addEventListener("submit", submitHandler);

query.addEventListener("input", inputHandler);

showList.addEventListener("click", clickHandler);

// fetch
async function fetcher(endpoint) {
  const response = await fetch(`${baseurl}/${endpoint}`);

  return await response.json();
}

function submitHandler(event) {
  event.preventDefault();

  fetcher(`search/shows?q=${query.value}`)
    .then((dataset) => render(dataset, query.value))
    .catch((error) => console.error(error.message));
}

function inputHandler(event) {
  submitDisableStateHandler();
}

function clickHandler(event) {
  if (event.target.nodeName !== "A") {
    return false;
  }

  event.preventDefault();

  const showId = event.target.dataset.id;
  const endpoints = [`shows/${showId}`, `shows/${showId}/episodes`];
  const fetchers = endpoints.map((endpoint) => fetcher(endpoint));

  Promise.all(fetchers)
    .then((dataset) => {
      const [show, episodes] = dataset;

      renderDetail(show, episodes);
    })
    .catch((error) => console.error(error.message));
}

// renders
function render(dataset, query) {
  const shows = dataset.map((data) => data.show);

  // clean show list before render new result
  showList.innerHTML = "";

  if (!shows.length) {
    showList.innerHTML = `No results for criteria <b>${query}</b>`;
  }

  for (const show of shows) {
    const li = document.createElement("li");
    const a = document.createElement("a");

    a.setAttribute("href", "#");
    a.setAttribute("data-id", show.id);
    a.textContent = show.name;

    li.append(a);
    showList.append(li);
  }
}

function renderDetail(show, episodes) {
  renderShow(show);
  renderEpisodes(episodes);
}

function renderShow(show) {
  // clean show list before render new result
  showDetail.innerHTML = "";

  // name
  const name = document.createElement("h1");
  const image = document.createElement("img");
  const summary = document.createElement("div");
  const detail = document.createElement("table");
  const premieredRow = document.createElement("tr");
  const premieredTitle = document.createElement("td");
  const premieredContent = document.createElement("td");
  const statusRow = document.createElement("tr");
  const statusTitle = document.createElement("td");
  const statusContent = document.createElement("td");
  const typeRow = document.createElement("tr");
  const typeTitle = document.createElement("td");
  const typeContent = document.createElement("td");
  const genresRow = document.createElement("tr");
  const genresTitle = document.createElement("td");
  const genresContent = document.createElement("td");
  const runtimeRow = document.createElement("tr");
  const runtimeTitle = document.createElement("td");
  const runtimeContent = document.createElement("td");
  const siteRow = document.createElement("tr");
  const siteTitle = document.createElement("td");
  const siteContent = document.createElement("td");
  const siteLink = document.createElement("a");
  const externalsRow = document.createElement("tr");
  const externalsTitle = document.createElement("td");
  const externalsContent = document.createElement("td");
  const externalsList = document.createElement("ul");
  
  // name
  name.textContent = show.name;

  // image
  if (show.image) {
    image.src = show.image.medium;
  }

  // summary
  summary.innerHTML = show.summary;

  // detail
  // premiered
  premieredTitle.textContent = "Premiered";
  premieredContent.textContent = show.premiered;

  premieredRow.append(premieredTitle);
  premieredRow.append(premieredContent);

  // status
  statusTitle.textContent = "Status";
  statusContent.textContent = show.status;

  statusRow.append(statusTitle);
  statusRow.append(statusContent);

  // type
  typeTitle.textContent = "Type";
  typeContent.textContent = show.type;

  typeRow.append(typeTitle);
  typeRow.append(typeContent);

  // genres
  genresTitle.textContent = "Genres";
  genresContent.textContent = show.genres.join(", ");

  genresRow.append(genresTitle);
  genresRow.append(genresContent);

  // runtime
  runtimeTitle.textContent = "Runtime";
  runtimeContent.textContent = show.runtime;

  runtimeRow.append(runtimeTitle);
  runtimeRow.append(runtimeContent);

  // Site
  siteTitle.textContent = "Site";
  siteLink.setAttribute("href", show.officialSite);
  siteLink.textContent = show.name;

  siteContent.append(siteLink);

  siteRow.append(siteTitle);
  siteRow.append(siteContent);

  
  // Externals
  externalsTitle.textContent = "Externals";
  const tvrage = document.createElement("li");
  const thetvdb = document.createElement("li");
  const imdb = document.createElement("li");  

  tvrage.textContent = `tvrage - ${show.externals.tvrage}` ;
  thetvdb.textContent = `thetvdb -${show.externals.thetvdb}`;
  imdb.textContent = `imdb - ${show.externals.imdb}`;

  externalsList.append(tvrage);
  externalsList.append(thetvdb);
  externalsList.append(imdb);

 externalsContent.append(externalsList);

  externalsRow.append(externalsTitle);
  externalsRow.append(externalsContent);


  // append to table
  detail.append(premieredRow);
  detail.append(statusRow);
  detail.append(typeRow);
  detail.append(genresRow);
  detail.append(runtimeRow);
  detail.append(siteRow);
  detail.append(externalsRow);


  // append
  showDetail.append(name);
  showDetail.append(image);
  showDetail.append(summary);
  showDetail.append(detail);
}

function renderEpisodes(episodes) {
  // clean episodes list before render new result
  episodeList.innerHTML = "";

  const seasons = groupBySeason(episodes);

  for (const season in seasons) {
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    const list = document.createElement("ul");

    summary.textContent = season;

    if (season === "1") {
      details.setAttribute("open", true);
    }

    for (const episode of seasons[season]) {
      const li = document.createElement("li");

      li.textContent = episode.name;

      list.append(li);
    }

    details.append(summary);
    details.append(list);

    episodeList.append(details);
  }
}

// helpers
function submitDisableStateHandler() {
  if (!query.value) {
    submitButton.setAttribute("disabled", "disabled");
  } else {
    submitButton.removeAttribute("disabled");
  }
}

function groupBySeason(episodes) {
  return episodes.reduce((previousValue, currentValue) => {
    if (!previousValue[currentValue.season]) {
      previousValue[currentValue.season] = [currentValue];
    } else {
      previousValue[currentValue.season] = previousValue[
        currentValue.season
      ].concat(currentValue);
    }
    return previousValue;
  }, {});
}

// init
submitDisableStateHandler();
