// CityModel.js
import { BaseResponse } from './BaseModel.js'; // Import the base

export class Product {
    constructor(row) {
        this.itemcode = row.itemcode;
        this.groupname = row.groupname;
        this.category = row.category;
        this.itemtype = row.itemtype;
        this.title = row.title;
        this.image = row.image;
        this.status = row.status;
        this.redirect = row.redirect;
        this.snippet_description = row.snippet_description;
        this.long_description = row.long_description;
        this.aplus_content = row.aplus_content;
        this.aplus_content_ids = row.aplus_content_ids;
        this.long_description_india = row.long_description_india;
        this.important_info = row.important_info;
        this.creator = row.creator;
        this.publisher_vendor_id = row.publisher_vendor_id;
        this.description_icons = row.description_icons;
        this.india_net_qty = row.india_net_qty;
        this.keywords = row.keywords;
        this.usblock = row.usblock;
        this.indiablock = row.indiablock;
        this.numviewed = row.numviewed;
        this.numviewed_india = row.numviewed_india;
        this.numviewed_global = row.numviewed_global;
        this.qty_step = row.qty_step;
        this.blog_date = row.blog_date;
        this.hscode = row.hscode;
        this.vendor = row.vendor;
        this.date_first_added = row.date_first_added;
        this.related_items = row.related_items;
        this.bundled_items = row.bundled_items;
        this.starrating_average = row.starrating_average;
        this.starrating_numbers = row.starrating_numbers;
        this.coltime = row.coltime;
    }

    /**
     * Optional: Helper to get keywords as an array
     */
    getKeywordsArray() {
        return this.keywords ? this.keywords.split(',').filter(k => k.trim() !== '') : [];
    }
}

// Extend BaseResponse instead of Array
export class Products  {
    constructor(product) {
        // 2. Add specific data for this class
        this.count = product.length; // Useful metric for lists
        this.data = product.map(row => new Product(row));
    }
}