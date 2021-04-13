import "./styles.css";
import {
  getSolidDataset,
  getThing,
  setThing,
  getStringNoLocale,
  setStringNoLocale,
  saveSolidDatasetAt,
  isContainer,
  getContainedResourceUrlAll,
  getThingAll,
  getContentType,
  getResourceInfo,
  getSourceUrl,
  getUrl,
  getUrlAll,
  solidDatasetAsMarkdown
} from "@inrupt/solid-client";
import { foaf } from "rdf-namespaces";
import { Thing } from "rdf-namespaces/dist/owl";

//import data from "@solid/query-ldflex";
//const xxldflex = require("@solid/query-ldflex")
const $rdf = require("rdflib"); // https://github.com/solid/solid-tutorial-rdflib.js
const LDP = $rdf.Namespace("http://www.w3.org/ns/ldp#");
const timeout = 3000;

const axios = require("axios");

const TYPE_PREDICATE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";

document.getElementById("app").innerHTML = `
<h1>Hello Solid!</h1>
<div>
  Based on the Hello Vanilla template on codesandbox.io.
  We use the same configuration as Parcel to bundle this sandbox, you can find more
  info about Parcel 
  <a href="https://parceljs.org" target="_blank" rel="noopener noreferrer">here</a>.
</div>
`;

const webId = "https://bartje.inrupt.net/profile/card#me";
const webIdPublic = "https://bartje.inrupt.net/public/";
const webIdResource = "https://bartje.inrupt.net/public/activities";

getSolidDataset(webId).then((profileDoc) => {
  if (profileDoc) {
    let retHtml = "<h1>Pod profile data</h1>";
    function AddHtml(s) {
      retHtml = retHtml.concat("<p>" + s + "</p>");
      return;
    }
    AddHtml("<h2>Profiel</h2>");
    AddHtml("WebID die gelezen wordt: " + webId);
    const profile = getThing(profileDoc, webId);
    const name = getStringNoLocale(profile, foaf.name);
    AddHtml("Naam (gelezen uit pod): " + name);
    // try reading from /public
    //AddHtml("<h2>Lezen uit /public</h2>");
    //const publicUrl = "https://bartje.inrupt.net/public/"
    //const publicDoc = await getSolidDataset(publicUrl)
    //AddHtml("Dit is een container: " + isContainer(publicUrl))
    //const allUrls = getContainedResourceUrlAll(publicDoc)
    // wrap up
    document.getElementById("poddata").innerHTML = retHtml;
  } else {
    document.getElementById("poddata").innerHTML =
      "Error: Pod data niet uitgelezen";
  }
});

getSolidDataset(webIdPublic).then((publicDoc) => {
  if (publicDoc) {
    let retHtml = "<h1>Pod /public</h1>";
    function AddHtml(s) {
      retHtml = retHtml.concat("<p>" + s + "</p>");
      return;
    }
    //AddHtml("<h2>Profiel</h2>")
    AddHtml("WebID /public die gelezen wordt: " + webIdPublic);
    // try reading from /public
    //const publicDoc = await getSolidDataset(publicUrl)
    AddHtml("Dit is een container: " + isContainer(webIdPublic));
    const allUrls = getContainedResourceUrlAll(publicDoc);
    const n = allUrls.length;
    AddHtml("Container bevat " + n + " urls, ");
    const allThings = getThingAll(publicDoc);
    for (let i = 0; i < n; ++i) {
      AddHtml(allUrls[i]);
    }

    AddHtml("Container bevat " + allThings.length + " Things, van het type:");
    const m = allThings.length;
    for (let i = 0; i < m; ++i) {
      AddHtml(i + " : " + getUrl(allThings[i], TYPE_PREDICATE));
      //isContainer(allThings[i]);
      // const thisThing = allThings[i];
      AddHtml(solidDatasetAsMarkdown(allThings[i]));
    }
    //const thing3 = allThings[3];
    //AddHtml("<h3>Details over bob.ttl</h3>")
    //const bobUrl = "https://bartje.inrupt.net/public/bob.ttl"
    document.getElementById("podpublic").innerHTML = retHtml;
  } else {
    document.getElementById("podpublic").innerHTML =
      "Error: Pod /public niet uitgelezen";
  }
});

getSolidDataset(webIdResource).then((resourceDoc) => {
  if (resourceDoc) {
    let retHtml = "<h1>Inspectie van " + webIdResource + "</h1>";
    function AddHtml(s) {
      retHtml = retHtml.concat("<p>" + s + "</p>");
      return;
    }
    AddHtml("Dit is een container: " + isContainer(webIdResource));
    const allUrls = getContainedResourceUrlAll(resourceDoc);
    const n = allUrls.length;
    AddHtml("Container bevat " + n + " URLs. ");
    const allThings = getThingAll(resourceDoc);
    AddHtml("Container bevat " + allThings.length + " Things. ");
    AddHtml(solidDatasetAsMarkdown(resourceDoc));
    //

    //
    document.getElementById("podpublicbob").innerHTML = retHtml;
  } else {
    document.getElementById("podpublicbob").innerHTML =
      "Error: Pod /public/bob.ttl niet uitgelezen";
  }
});

function fetch_resource(resource_iri) {
  return new Promise(function (resolve, reject) {
    const store = $rdf.graph();
    const fetcher = new $rdf.Fetcher(store, timeout);
    fetcher.nowOrWhenFetched(resource_iri, function (ok, body, xhr) {
      if (!ok) {
        reject("Oops, something happened and couldn't fetch data");
      } else {
        const resource = $rdf.sym(resource_iri);
        // Here, we look up the inbox from the calendar representation
        //const inbox = store.any(resource, LDP("inbox"));
        //resolve(inbox === undefined ? inbox : inbox.value);
        resolve(resource.value);
      }
    });
  });
}

// Refs
// https://linkeddata.github.io/rdflib.js/Documentation/webapp-intro.html

axios
  .get(webIdResource)
  .then((response) => {
    let retHtml = "<h1>Lezen met rdflib van: " + webIdResource + "</h1>";
    function AddHtml(s) {
      retHtml = retHtml.concat("<p>" + s + "</p>");
      return;
    }
    // Let us just display the content of the resource
    //console.log(response.data);
    console.log("\n --- \n");
    AddHtml("Ruwe data van resource: <br> " + response.data);
    //
    const mimeType = "text/turtle";
    let store = $rdf.graph();
    try {
      $rdf.parse(response.data, store, webIdResource, mimeType);
      console.log("RDF parse OK");
    } catch (err) {
      console.log(err);
    }
    AddHtml("Data in graph 'store' of length: " + store.length);
    //AddHtml(store.toNT())
    AddHtml(store.toString());
    //AddHtml(store.toCanonical())
    let quads = store.match(null, null, "Linda");
    console.log(quads.length);
    AddHtml(
      "Quads in the graph for which the subject is 'Linda': " +
        quads[0].toString()
    );
    document.getElementById("rdflibdata").innerHTML = retHtml;
    // Following lines attempt to use fetcher - not further explored
    /*     fetch_resource(webIdResource)
      .then(resultaat => {
        console.log("The result of " + webIdResource + " is " + resultaat);
        AddHtml("Resultaat verkregen: " + resultaat.value)
        document.getElementById("rdflibdata").innerHTML = retHtml;
      })
      .catch(error => {
        console.log(error);
      }); 
 */ //document.getElementById("rdflibdata").innerHTML = retHtml;
  })
  .catch((error) => {
    console.log(error);
  });
