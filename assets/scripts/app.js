function ready(fn) {
  if (document.readyState !== "loading") {
    fn();
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}

function $(query) {
  return document.querySelector(query);
}

function http(method, url, callback) {
  const request = new XMLHttpRequest();

  request.open(method, url);
  request.send();

  request.onreadystatechange = () => {
    if (request.readyState === 4) {
      if (request.status === 200) {
        callback(JSON.parse(request.responseText));
      } else {
        console.error(request.status);
      }
    }
  };
}

ready(() => {
  $("form").addEventListener("submit", (event) => {
    event.preventDefault();

    const cep = $("#search").value;

    const fillData = ({ cep, state, city, neighborhood, address }) => {
      $("#cep").textContent = cep;
      $("#state").textContent = state;
      $("#city").textContent = city;
      $("#neighborhood").textContent = neighborhood || "-";
      $("#address").textContent = address || "-";

      window.location = "/#response";
    };

    http("GET", `https://api.correios.magnobiet.com/?cep=${cep}`, fillData);
  });
});
