var fs = require('fs');
var co_wait = require('co-wait');
var co = require('co');
var nightmare;
const args = process.argv.slice(2); // normalize arguments
const Nightmare = require('nightmare');
const START = 'https://www.bankofamerica.com/';
const WAIT_TIME = 5000; // Dont'go less than 1000 due to web async issues
var out = [];
var next_page = true;
var expand_elements = '.record > .date-action > a';
var username ='';
var password ='';

co(function*() {

  // Set up.
  yield newNightmare();
  yield login();
  yield nightmare.wait(10000)
  yield setDateRange();

  var next_page = true;
  var page_num = 0;

  while (next_page) {
    var page_records = [];
    var element_count = yield getElementCount();

    var page_meta_data = JSON.stringify({
      "record_count_this_page: " : element_count,
      "page_number: " : page_num
    });

    console.log(page_meta_data);
    page_records.push(page_meta_data);

    for (var i = 0; i < element_count; i++) {
      yield expandElement(i);
      yield nightmare.wait(100)
      var record = yield extractInfo();
      record = JSON.stringify(record);
      page_records.push(record);
      out.push(record);
    }
    saveinfoToFileSync("page" + page_num + ".json", page_records);
    console.log("Records saved:" + page_records.length);
    page_num = page_num + 1;
    next_page = yield hasNextPage();
    if(next_page){
      yield clickNextPage()
      yield nightmare.wait(WAIT_TIME)
    }
  }
  saveinfoToFileSync("final.json", out);
}).catch(onerror);

function hasNextPage() {
  return co(function*() {
    return yield nightmare
      .wait(WAIT_TIME)
      .exists('[name="prev_trans_nav_bottom"]')
  })
}

function clickNextPage(){
  return co(function*() {
    return yield nightmare
      .wait(WAIT_TIME)
      .click('[name="prev_trans_nav_bottom"]')
  })
}

// Expecting an expanded element
function extractInfo() {
  return co(function*() {
    return yield nightmare
      .evaluate(() => {
        // remove a ton of cruft
        $('.trans-categ-edit-link').remove();
        $('.categ-merchant-name-edit-link').remove();
        $('.clearboth').remove()
        $('.merchant-name-text-edit-sec').remove()
        $('.categ-edit-section').remove()
        $('#merchant-transaction-category-help').remove()
        $('.categ-merchant-name-edit-link').remove()

        // get the last element(timing errors may cause multiple elements to be open)
        element = $('.transDetailCell dl').last();

        var record = {}
        key = "";
        $(element).children().each(function(index) {
          //special zero case which all mods == 0
          if (index == 0 || !(index % 2)) {
            key = this.innerText
            record[key] = "";
            return;
          }

          if (!(index % 1)) {
            record[key] = this.innerText
          }

        })
        console.log(record)
        return record;
      })
  })
}

function getElementCount() {
  return co(function*() {
    var elements = yield nightmare
      .wait(WAIT_TIME)
      .evaluate((expand_elements) => {
        try {
          return document.querySelectorAll(expand_elements).length;
        } catch (error) {
          console.error("Failed Getting elements" + error);
          throw error;
        }
      }, expand_elements)
    return elements;
  })
}

// 01/01/2017 => 12/31/2017
function setDateRange() {
  return co(function*() {
    yield nightmare
      .click('[name="More_options"]')
      .select('#search-select-timeframe', 'custom-date')
      .wait('#search-calendar-from')
      .type('#search-calendar-from', '01/01/2017')
      .type('#search-calendar-to', '')
      .wait(WAIT_TIME)
      .type('#search-calendar-to', '12/31/2017')
      .click('.moreoptions-search')
      .wait(WAIT_TIME)
  })
}

function login() {
  return co(function*() {
    yield nightmare
      .wait(WAIT_TIME)
      .goto(START)
      .type('#onlineId1', username)
      .type('#passcode1', password)
      .click("#signIn")
      .wait('[name="DDA_SB_details"]')
      .click('[name="DDA_SB_details"]')
      .wait('.TL_NPI_AcctName')
  });
}

function expandElement(element_to_click) {
  return co(function*() {
    try {
      yield nightmare
        .wait(WAIT_TIME)
        .evaluate((expand_elements, element_to_click) => {
          let elements = document.querySelectorAll(expand_elements);
          $(elements[element_to_click]).click();
        }, expand_elements, element_to_click);
    } catch (error) {
      console.error("Failed expandElement" + error);
      throw error;
    }
  })
}


function clickTxArrows() {
  return co(function*() {
    try {
      yield nightmare
        .wait(WAIT_TIME)
        .evaluate(() => {

          let elements = document.querySelectorAll(
            '[name="cards_expand_transaction_arrow"], [name="deposit_expand_transaction_arrow"],[name="otherpayment_expand_transaction_arrow"]'
          );

          var counter = {
            i: 0
          };
          var out = [];

          var tid = setInterval(function() {
            clicky(elements, counter, out);
            gatherInfo(out);
            counter.i = counter.i + 1;
          }, 1000);



          function clicky(elements, counter, out) {
            console.log(counter.i)
            if (counter.i == elements.length) {
              clearInterval(tid);
              console.log(out);
              return;
            }
            $(elements[counter.i]).click();
          }

          function gatherInfo(out) {
            element = $('.transDetailCell dl').last();

            var record = {}
            key = "";
            $(element).children().each(function(index) {
              //special zero case which all mods == 0
              if (index == 0 || !(index % 2)) {
                key = this.innerText
                record[key] = "";
                return;
              }

              if (!(index % 1)) {
                record[key] = this.innerText
              }

            })
            out.push(record);
          }
        })
        .wait(WAIT_TIME)
    } catch (error) {
      console.error("Failed to click on arrows " + error);
      throw error;
    }
  });
}

function clicky(element) {
  console.log("Clicky");

  co(function*(element) {
    $(element).click();
    yield co_wait(1000);
  });
}


function newNightmare() {
  return co(function*() {

    yield endNightmare();

    nightmare = Nightmare({
      executionTimeout: 40000,
      waitTimeout: 40000,
      openDevTools: {
        mode: 'detach'
      },
      show: true
    }).viewport(1600, 1200);
  });
}

function endNightmare() {
  return co(function*() {
    if (nightmare != null) {
      yield nightmare.end();
      nightmare = null;
    }
  });
}

function onerror(err) {
  console.error(err.stack);
}

function saveinfoToFileSync(filename, info) {
  console.log("Storing Info in file");
  try {
    fs.appendFileSync('./' + filename, info);
  } catch (error) {
    console.log('Failed storing info in file.')
    throw error;
  }
}
