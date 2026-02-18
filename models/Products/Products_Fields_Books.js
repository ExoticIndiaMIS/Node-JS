import {format} from 'date-fns';
export class products_fields_book {
    constructor(row) {
        this.itemcode = row.itemcode;
        this.isbn = row.isbn;
        this.author = row.author;
        this.publisher = row.publisher;
        this.language = row.language;
        this.pages = row.pages;
        this.cover_type = row.cover_type;
        this.edition = row.edition;
        this.publication_date = row.publication_date;
        this.description = row.description;
        this.weight_to_show = row.weight_to_show;
        this.variation_name_color = row.variation_name_color;
        this.variation_name_size = row.variation_name_size;
        this.mark_as_sold = row.mark_as_sold;
        this.coltime =format(new Date(row.coltime), 'yyyy-MM-dd HH:mm:ss a');
    }
}

export class Products_Fields_Books {
    constructor(rows = []) {
        return rows.map(row => new products_fields_book(row));
    }
}