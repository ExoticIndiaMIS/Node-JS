select p.itemcode AS "itemcode",
      p.title AS "Title",
      psp.size AS "size",
      psp.color AS "color",
      psp.dimensions AS "Dimensions",
      psp.product_weight AS "Product_Weight",
      psp.product_weight_unit AS "Product_Weight_Unit",
      psp.prod_height AS "Prod_Height",
      psp.prod_width AS "Prod_Width",
      psp.prod_length AS "Prod_Length",
      psp.length_unit AS "Length_Unit",
      psp.local_stock AS "Local_Stock",
      psp.upc AS "Upc",
      case
                when (psp.price<300
                and p.groupname = 'sculptures') then Round(psp.price + psp.price * 0.15, 0)
                when (psp.price>300
                and p.groupname = 'sculptures') then Round(psp.price + psp.price * 0.25, 0)
                when ( p.groupname = 'jewelry') then Round(psp.price + psp.price * 0.20, 0)
                when (psp.price<300
                and p.groupname = 'paintings') then Round(psp.price + psp.price * 0.15, 0)
                when (psp.price>300
                and p.groupname = 'paintings') then Round(psp.price + psp.price * 0.25, 0)
                when (psp.price<300
                and p.groupname = 'homeandliving') then Round(psp.price + psp.price * 0.15, 0)
                when (psp.price>300
                and p.groupname = 'homeandliving') then Round(psp.price + psp.price * 0.25, 0)
                when (psp.price<300
                and p.groupname = 'textiles') then Round(psp.price + psp.price * 0.15, 0)
                when (psp.price>300
                and p.groupname = 'textiles') then Round(psp.price + psp.price * 0.25, 0)
                else Round(psp.price * 0.05 + psp.price, 0)
        end AS "Website_Latest_Dollar_Price",
      psp.price_india +psp.price_india*psp.gst/100 AS "Website_Latest_India_Price" from 
                        products_stock_prices psp 
                        left join products p on p.itemcode=psp.itemcode
                        left join products_fields_product pfp on
                        pfp.itemcode = psp.itemcode
                        left join products_fields_book pfb on
                        pfb.itemcode = psp.itemcode where p.itemcode in ('NAA347')