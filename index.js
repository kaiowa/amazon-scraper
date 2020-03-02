const axios = require("axios")
const cheerio = require("cheerio")
const cheerioTableparser = require('cheerio-tableparser');
const fs=require('fs');
const db=require('./lib/db');
const escape=require('sql-template-strings');
var _ = require('underscore');

async function getProducts(db){
  const Products=await db.query(escape`
    SELECT id,url ,cat ,done from scrap  order by RAND() limit 3
  `);
  return Products;
}

async function fetchHTML(url) {
  const { data } = await axios.get(url)
  return cheerio.load(data)
}

async function getProduct(element){
  const $=await fetchHTML(element.url);
  cheerioTableparser($);
  const title=$('#productTitle').text().trim();
  const price=$('#priceblock_ourprice').text().trim();
  const stars=$('.reviewCountTextLinkedHistogram.noUnderline').text().replace(/\n/g,'').trim();
  let images=JSON.parse($('#landingImage').attr('data-a-dynamic-image'));
  let imagesP=[];
  _.each(images,function(index,item){
    const image={
      url:item
    }
    imagesP.push(image);
  })
  const technicalDetails=$('.pdTab table');
  let productDetails=[];
  var data = technicalDetails.parsetable(false, false, true);
  _.each(data[0],function(item,index){
    if(item){
      let propsP={
        "title":item,
        "value":data[1][index].replace(/\n/g,'')
      }
      productDetails.push(propsP);
    }
  });

  const product={
    title:title,
    price:price,
    images:imagesP,
    details:productDetails,
    stars:stars
  }
  return product;
}

(async () => {

  const Productos=await getProducts(db);
  Productos.forEach(async (element) => {
    let producto=await getProduct(element);
    console.log(producto);
  });

})();