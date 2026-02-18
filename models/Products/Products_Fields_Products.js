import {format} from 'date-fns';

export class products_fields_product {
    constructor(row) {
        this.itemcode = row.itemcode;
        this.material = row.material;
        this.weight_to_show = row.weight_to_show;
        this.optionals = row.optionals;
        this.variation_name_color = row.variation_name_color;
        this.variation_name_size = row.variation_name_size;
        this.coltime = format(new Date(row.coltime), 'yyyy-MM-dd HH:mm:ss a');
    }
}

export class Products_Fields_Products {
    constructor(rows = []) {
        return rows.map(row => new products_fields_product(row));
    }
}