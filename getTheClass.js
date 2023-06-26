// getTheClass.js
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

const url = "https://onepiece.nchu.edu.tw/cofsys/plsql/crseqry_home_now";

async function getTheListings(query) {
  let years = {}
  const queryTarget = query
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    const select = $(`select[name="${queryTarget}"]`);
    select.find('option').each((idx, element) => {
      const key = $(element).text();
      const value = $(element).val();
      years[key] = value;
    });
  } catch (e) {
    console.log(e);
  }
  return years;
}

async function crawlData(queryJSON) {

  const year = queryJSON["學年期"]
  const department = queryJSON["系所"]
  const career = queryJSON["學制"]
  const grade = queryJSON["年級"]
  const week = queryJSON["星期"]
  const language = queryJSON["授課語言"]
  const emi = queryJSON["emi"]
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  try {
    await page.goto("https://onepiece.nchu.edu.tw/cofsys/plsql/crseqry_home");
    if(year){
      await page.waitForSelector('select[name="v_year"]');
      await page.select('select[name="v_year"]', year);
    }
    
    if(career){
      await page.waitForSelector('select[name="v_career"]');
      await page.select('select[name="v_career"]', career);
    }
    if(grade){
      await page.waitForSelector('select[name="v_level"]');
      await page.select('select[name="v_level"]', grade);
    }
    if(language){
      await page.waitForSelector('select[name="v_lang"]');
      await page.select('select[name="v_lang"]', language);
    }
    
    if(week){
      await page.waitForSelector('select[name="v_week"]');
      await page.select('select[name="v_week"]', week);
    }
    
    if(emi){
      await page.waitForSelector('select[name="v_emi"]');
      await page.select('select[name="v_emi"]', emi);
    }
    if(department){
      await page.waitForSelector('select[name="v_dept"]');
      await page.select('select[name="v_dept"]', department);
    }
    
    await page.click('input[type="submit"][value="開始查詢"]');
    await page.waitForResponse((response) => {
      return response.url().includes("crseqry_home_now") && response.status() === 200;
    });
    const htmlContent = await page.content();
    const $ = cheerio.load(htmlContent)
    const table = $('table.word_13');
    
    const tableContent = [];
    $(table).find('tbody').each((bodyIndex, bodyElement) => {
      let tbodyData = []
      if(bodyIndex !== 0){
        $(bodyElement).find('tr').each((rowIndex, rowElement) => {
          let rowData = ""
          $(rowElement).find('td').each((cellIndex, cellElement) => {
            // Extract the text content of the cell
            const cellText = $(cellElement).text().trim();
            // Add the cell content to the current row's data
            if(cellIndex === 1)
              rowData += "號碼：" + cellText + "\n"
            else if(cellIndex === 2)
              rowData += "名稱：" + cellText + "\n";
            else if(cellIndex === 8)
              rowData += "上課時間：" + cellText;
          });
          tbodyData.push(rowData)
        
        })
        tableContent.push(tbodyData)
      }
    })
    
    // console.log(tableContent)
    return tableContent
    
  } catch (error) {
    console.log(error);
  } finally {
    await browser.close(); // Close the browser and the page
  }
}



module.exports.crawlData = crawlData;
module.exports.getTheListings = getTheListings;
