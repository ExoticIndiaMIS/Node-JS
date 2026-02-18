import {format} from 'date-fns';

export class product_stock_price {
    constructor(row) {
        // Identity & Status
        this.itemcode = row.itemcode;
        this.status = row.status;
        this.item_level = row.item_level;
        this.marketplace_vendor = row.marketplace_vendor;
        this.location = row.location;
        this.upc = row.upc;
        this.asin = row.asin;
        this.joined_item_codes = row.joined_item_codes;
        this.amazon_itemcode_alias = row.amazon_itemcode_alias;

        // Physical Specs
        this.size = row.size;
        this.color = row.color;
        this.colormap = row.colormap;
        this.dimensions = row.dimensions;
        this.product_weight = row.product_weight;
        this.product_weight_unit = row.product_weight_unit;
        this.prod_height = row.prod_height;
        this.prod_width = row.prod_width;
        this.prod_length = row.prod_length;
        this.length_unit = row.length_unit;

        // Inventory & Stock
        this.local_stock = row.local_stock;
        this.fba_in = row.fba_in;
        this.fba_us = row.fba_us;
        this.fba_eu = row.fba_eu;
        this.vendor_us = row.vendor_us;
        this.prime_india = row.prime_india;
        this.topurchase = row.topurchase;
        this.permanently_available = row.permanently_available;

        // Lead Times & Backorders
        this.backorder_percent = row.backorder_percent;
        this.backorder_weeks = row.backorder_weeks;
        this.leadtime = row.leadtime;
        this.instock_leadtime = row.instock_leadtime;
        this.amazon_leadtime = row.amazon_leadtime;

        // Flex / Removal
        this.flex_status = row.flex_status;
        this.flex_removal = row.flex_removal;

        // Pricing & Costs (India)
        this.price_india = row.price_india;
        this.price_india_suggested = row.price_india_suggested;
        this.mrp_india = row.mrp_india;
        this.gst = row.gst;
        this.discount_india = row.discount_india;
        this.today_india = row.today_india;

        // Pricing & Costs (Global)
        this.price = row.price;
        this.permanent_discount = row.permanent_discount;
        this.discount_global = row.discount_global;
        this.today_global = row.today_global;
        this.cp = row.cp; // Cost Price
        this.sourcingfee = row.sourcingfee;
        this.sourcingfee_backup = row.sourcingfee_backup;
        this.shippingfee = row.shippingfee;

        // Sales Metrics
        this.numsold = row.numsold;
        this.numsold_india = row.numsold_india;
        this.numsold_global = row.numsold_global;
        this.lastsold = row.lastsold;
        this.amazon_sold = row.amazon_sold;

        // Dates & Flags
        this.date_added = format(new Date(row.date_added), 'yyyy-MM-dd HH:mm:ss a');
        this.stock_date_added = format(new Date(row.stock_date_added), 'yyyy-MM-dd HH:mm:ss a');
        this.amazon_added = row.amazon_added;
        this.wayfair_added = row.wayfair_added;
        this.unicommerce_added = row.unicommerce_added;
        this.embedding_added = row.embedding_added;

        // Media
        this.youtube_links = row.youtube_links;
        this.sketchfab_links = row.sketchfab_links;

        // System
        this.coltime = format(new Date(row.coltime), 'yyyy-MM-dd HH:mm:ss a');
    }
}

export class Product_Stock_Prices {
    constructor(rows = []) {
        return rows.map(row => new product_stock_price(row));
    }
}

