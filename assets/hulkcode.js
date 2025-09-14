function start(){
  var checkout_selectors = "input[name='checkout']:not(.hulkapps-ignore), input[value='Checkout']:not(.hulkapps-ignore), button[name='checkout']:not(.hulkapps-ignore), [href$='checkout']:not(.hulkapps-ignore), button[value='Checkout']:not(.hulkapps-ignore), input[name='goto_pp'], button[name='goto_pp'], input[name='goto_gc'], button[name='goto_gc'],.hulkapps_checkout"
  if(window.hulkapps.page_type == "product"){
    var variants = window.hulkapps.product.variants;
    window.hulkapps.product.selected_variant = null;
    window.product_page_btn_condition = function(){
      var options = [];
      var selector_var = document.querySelectorAll(".single-option-selector,.swatch-element input[type='radio'],.single-option-selector__radio:checked, select[data-option='option1'], select[data-option='option1']:checked, select[data-option='option2'], select[data-option='option1']:checked, select[data-option='option3'], select[data-option='option3']:checked, select[data-index='option1'], select[data-index='option1']:checked, select[data-index='option2'], select[data-index='option1']:checked, select[data-index='option3'], select[data-index='option3']:checked, ul li div[swatch-option='option1'], input[type='radio']:checked");  
      selector_var.forEach(function(selector) {
        options.push(selector.value)
      });
      var grep = function(items, callback) {
          var filtered = [],
              len = items.length,
              i = 0;
          for (i; i < len; i++) {
              var item = items[i];
              var cond = callback(item);
              if (cond) {
                  filtered.push(item);
              }
          }
          return filtered;
      };
      options = grep(options, function(n){ return (n); });
      if (options.length == 1){
        var selected_variant_title = options;
      }else{
        var selected_variant_title = options.join(' / ');
      }
      var flag = 0;
      
      // Fluid Theme for getting Variant ID Start
      if(document.querySelector('.selected_variant span') != null){
          var variantId = document.querySelector('.selected_variant span').textContent;
        }else {
      // Fluid Theme for getting Variant ID End
      Object.keys(variants).forEach(function(key){
        var val = variants[key];
        selected_variant_title = selected_variant_title.toString().toLowerCase();
        var variantTitle = val.title.toString().toLowerCase();
        if(variantTitle.trim() == selected_variant_title.trim()){
        // if(selected_variant_title.includes(variantTitle)){
        var variantId = val.id;
        window.hulkapps.product.selected_variant = val.id
        }
      });
      }
    }
  }
  window.loadScript = function(url, callback) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    // If the browser is Internet Explorer
    if (script.readyState){
      script.onreadystatechange = function() {
        if (script.readyState == "loaded" || script.readyState == "complete") {
          script.onreadystatechange = null;
          callback();
        }
      };
      // For any other browser
    } else {
      script.onload = function() {
        callback();
      };
    }
    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
  };

  window.checkAppInstalled = function(version) {
    window.hulkapps.is_volume_discount = true
    window.hulkapps.is_product_option = false
    if(window.hulkapps.is_product_option){
      loadScript(window.hulkapps.po_url+'/intl-tel-input.js', function() {
        commonJS(version);
       cartPageJS(version);
       productPageJS(version);
     });
    }else{
      commonJS(version);
      cartPageJS(version);
      productPageJS(version);
    }
  };

  window.commonJS = function($){
    window.hulkappsDoActions = function(data) {
      if(data){
        if(data.discounts.discount_show){
          $(".discount_code_box").css("display","block");
        }

        if(data.discounts.plan){
          $(".edit_cart_option").css("display","block");
        }

        if (typeof data.discounts == "object" && typeof data.discounts.cart == "object" && typeof data.discounts.cart.items == "object") {
          hulkappsShowCartDiscounts(data.discounts)
        }
        
        if(data.discounts.is_draft_order){
          $(document).on('click', checkout_selectors, function(e){
            e.preventDefault();
            if (typeof hulkappsCheckout != "function") {
              window.location = "/checkout";
            }
            // Order Delivery Date App Code for validation issue
            if(typeof hulkappsCheckoutClick === 'undefined'){
              $(this).attr('disabled','disabled');
              hulkappsCheckout();
            }else{
              var result = hulkappsCheckoutClick();
              if(result == true){
                $(this).attr('disabled','disabled');
                hulkappsCheckout();
              }
            }
          });
        }
      }
    }
    window.hulkappsShowCartDiscounts = function(discounts) {
      window.hulkapps.discounts = discounts;
      var flag=0;
      discounts.cart.items.forEach(function(item) {
        if (item.cart_discount_away_msg_html){
          $(".hulkapps-reminder[data-key='" + item.key + "']").html(item.cart_discount_away_msg_html);
        }else{
          $(".hulkapps-reminder[data-key='" + item.key + "']").html('');
        }
        if (item.discounted_price < item.original_price) {
          flag=1;
          $(".hulkapps-cart-item-price[data-key='" + item.key + "']").html("<span class='original_price' style='text-decoration:line-through;'>" + item.original_price_format + "</span><br/>" + "<span class='discounted_price'>" + item.discounted_price_format + "</span>");
          $(".hulkapps-cart-item-line-price[data-key='" + item.key + "']").html("<span class='original_price' style='text-decoration:line-through;'>" + item.original_line_price_format + "</span><br/>" + "<span class='discounted_price'>" + item.discounted_line_price_format + "</span>")
        }else{
          $(".hulkapps-cart-item-price[data-key='" + item.key + "']").html("<span class='original_price'>" + item.original_price_format + "</span>");
          $(".hulkapps-cart-item-line-price[data-key='" + item.key + "']").html("<span class='original_price'>" + item.original_line_price_format + "</span>")
        }
      });
      $(".hulkapps-discount-bar").html('');
      $(".hulkapps-cart-total,.hulkapps-discount-reminder-msg").remove();
      $(".hulkapps-cart-original-total").css("text-decoration", "none");
      if(flag==1 || discounts.cart_discount_msg_html || discounts.is_draft_order){
        if(discounts.final_with_discounted_price == null && discounts.discounted_price_total != discounts.original_price_total){
          $(".hulkapps-cart-original-total").html(discounts.original_price_total).css("text-decoration", "line-through"); 
          $("<span class='hulkapps-cart-total'>" + discounts.discounted_price_total + "</span>").insertAfter('.hulkapps-cart-original-total');
        }else if(discounts.final_with_discounted_price != null){
          $(".hulkapps-cart-original-total").html(discounts.original_price_total).css("text-decoration", "line-through"); 
          $("<span class='hulkapps-cart-total'>" + discounts.final_with_discounted_price + "</span>").insertAfter('.hulkapps-cart-original-total');
        }
        if($(".hulkapps-discount-bar").length > 0){
          $(".hulkapps-discount-bar").html(discounts.cart_discount_msg_html)
        }else{
          $('form[action="/cart"]').prepend(discounts.cart_discount_msg_html)
        }
      }
      if(discounts.cart_discount_reminder_msg_html){
        if($(".hulkapps-cart-reminder").length > 0){
          $(".hulkapps-cart-reminder").html(discounts.cart_discount_reminder_msg_html)
        }else if($(".alert.hulkapps-discount-bar-msg").length > 0){
          $('.alert.hulkapps-discount-bar-msg').after(discounts.cart_discount_reminder_msg_html)
        }else{
          $('form[action="/cart"]').prepend(discounts.cart_discount_reminder_msg_html)
        }
      }
      $('.hulkapps_summary').remove();
      if (discounts.discount_code && discounts.discount_error == 1){
        $(".hulkapps-cart-original-total").html(discounts.original_price_total);
        $(".hulkapps_discount_hide").after("<span class='hulkapps_summary'>Discount code does not match</span>");
        localStorage.removeItem('discount_code');
      }else if (discounts.is_free_shipping){
        $(".hulkapps_discount_hide").after("<span class='hulkapps-summary-line-discount-code'><span class='discount-tag'>"+ discounts.discount_code +"<span class='close-tag'></span></span>Free Shipping");
      }else if(discounts.discount_code && $('.discount_code_box').is(":visible")){
        $(".hulkapps_discount_hide").after("<span class='hulkapps-summary-line-discount-code'><span class='discount-tag'>"+ discounts.discount_code +"<span class='close-tag'></span></span><span class='hulkapps_with_discount'>"+" -" + discounts.with_discount + "</span></span><span class='after_discount_price'><span class='final-total'>Total</span>"+discounts.final_with_discounted_price +"</span>");
        if(flag ==1 || discounts.cart_discount_msg_html){
          $(".hulkapps-cart-original-total").html(discounts.discounted_price_total).css("text-decoration", "line-through");
        }else{
          $(".hulkapps-cart-original-total").html(discounts.original_price_total).css("text-decoration", "line-through");
        }
        $(".hulkapps-cart-total").remove();
      }else{
        $(".hulkapps-cart-original-total").html(discounts.original_price_total);
        localStorage.removeItem('discount_code');
      }
    }
    window.hulkappsCheckout = function() {
      for (var i = 0; i < window.hulkapps.cart.items.length; i++) {
        var item = window.hulkapps.cart.items[i];
        var el = document.querySelectorAll("[id='updates_" + item.key + "']");
        if (el.length != 1) {
          el = document.querySelectorAll("[id='updates_" + item.variant_id + "']")
        }
        if (el.length == 1) {
          window.hulkapps.cart.items[i].quantity = el[0].value
        }
      }
      var pv_draft_url = '';
      if(window.hulkapps.is_volume_discount){
        pv_draft_url = window.hulkapps.vd_url+"/shop/create_draft_order";
      }else if(window.hulkapps.is_product_option){
        pv_draft_url = window.hulkapps.po_url+"/store/create_draft_order";
      }
      var storage_code = localStorage.getItem('discount_code');
      var ctags = window.hulkapps.customer ? window.hulkapps.customer.tags : '';

      $.getJSON('/cart.js', function(cart) {
        window.hulkapps.cart = cart;
        $.ajax({
          type: "POST",
          url: pv_draft_url,
          data: {cart_json: window.hulkapps,store_id: window.hulkapps.store_id, discount_code: storage_code,cart_collections: JSON.stringify(window.hulkapps.cart_collections),ctags: ctags},
          crossDomain: true,
          success: function(res) {
            if(typeof res == "string"){
              
              window.location.href = res
            }else{
              window.location.href = "/checkout"
            }
            localStorage.removeItem('discount_code');
          }
        });
      });
    }
    window.eligible_offer = function(data){
      var offer = data['eligible_offer'];
      var currency_symbol = data['store_currency']
      var p_id = data['p_id']
      var date_validate = data['is_date_validate']
      var charges_applied = data['charges_applied']
      var display = data['display_setting']
      var collection_object = data['collection_object']
      var level_html 
      // if (charges_applied && date_validate){
      if (charges_applied ){
        var level = JSON.parse(offer['offer_levels'])
        if (offer['display_offer_table_or_banner'] == 'grid'){
            var offer_layout_id = offer['offer_layout_id'] 
            return level_html = get_offer_table_layout(offer_layout_id, display, level, currency_symbol)
        }else if(offer['banner_msg']){
          var quantity, price, discount_type, discount, close_icon
          quantity = level[0][0]
          price = level[0][1]
          discount_type = level[0][2]
          discount = (discount_type == 'price_discount') ? currency_symbol+price+" "+display['off_text'] : (discount_type == 'fix_price') ?  display['get_at_text']+" "+price : price+"% "+display['off_text']
          close_icon = (offer['is_display_close_btn']) ? '<a href="javascript:void(0)" class="close_banner" style="position: absolute;top: 0;right: 0;padding: 5px 10px 5px;background: #cecece;font-size: 15px;">X</a>' : ''
         
          level_html = "<div class='alert hulkapps-banner-msg'>"+offer['banner_msg']+" "+close_icon+"</div><style>.hulkapps-banner-msg {font-size:"+offer['banner_font_size']+"px;color: "+offer['banner_font_color']+"; background-color: "+offer['banner_bg_color']+";min-height: 50px;padding: 6px 30px 6px 15px;position: relative; }"+display['custom_css']+"</style><script>"+display['custom_js']+"</script>"
          
          collection_object = (collection_object)? collection_object : ''
          return level_html = level_html.replace("{{qty}}", quantity ).replace("{{offer_type}}", collection_object+" "+offer['offer_type']).replace("{{discount}}", discount)
        }
      }else if(!charges_applied && data['eligible_offer']['offer_type']=="product"){
            var offer_layout_id = 1
            var level = JSON.parse(offer['offer_levels'])
            return level_html = get_offer_table_layout(offer_layout_id, display, level, currency_symbol)
      }else{
           return levels_html = ''
      }
    }
    window.get_offer_table_layout = function(offer_layout_id,display,level, currency_symbol){
      levels_html = ''
      if(offer_layout_id == 1 || offer_layout_id== 2 || offer_layout_id == 4){
        levels_html += "<div class='hulkapps-volume-discount-tiers'><table class='hulkapps-table table'><thead><tr><th>"+display['min_qty_text']+"</th><th>"+display['discount_text']+"</th></tr></thead><tbody>"
      }else{
        levels_html += "<div class='hulkapps-volume-discount-tiers'><table class='hulkapps-table table'><thead><tr><th>"+display['min_qty_text']+"</th><th>"+display['max_qty_text']+"</th><th>"+display['discount_text']+"</th></tr></thead><tbody>"
      }
      if(level.length > 0){
        var quantity, price, discount_type, discount
        $.each(level, function(key,value) {
          quantity = value[0]
          price = (display['include_decimal_in_offer_table'] ? value[1] : parseInt(value[1]))
          discount_type = value[2]
          if(offer_layout_id == 1){
            discount = (discount_type == 'price_discount') ? currency_symbol+price+" "+display['off_text'] : (discount_type == 'fix_price') ?  display['get_at_text']+" "+ currency_symbol+price : price+"% "+display['off_text']
            levels_html += "<tr><td>"+display['min_qty_before_text']+" "+quantity+" "+display['min_qty_after_text']+ "</td><td><span class='hulkapps-price'>"+discount+"</span></td></tr>"
          }else if(offer_layout_id == 2){
            discount = (discount_type == 'price_discount') ? currency_symbol+price : (discount_type == 'fix_price') ?  display['get_at_text']+" "+ currency_symbol+price : price+"%"
            levels_html += "<tr><td>"+quantity+ " "+display['min_qty_after_text']+"</td><td><span class='hulkapps-price'>"+discount+"</span></td></tr>"
          }else if(offer_layout_id == 3){
            discount = (discount_type == 'price_discount')? currency_symbol+""+price : ((discount_type == 'fix_price') ? display['get_at_text']+" "+ currency_symbol+""+price : price+"%")
            var second_qty = (quantity)? (level[key+1]) ? level[key+1][0] - 1 : '+' : ''
            levels_html += "<tr><td>"+quantity+"</td><td>"+ second_qty +"</td><td><span class='hulkapps-price'>"+discount+"</span></td></tr>" 
          }else if(offer_layout_id == 4){
            discount = (discount_type == 'price_discount')? currency_symbol+""+price : ((discount_type == 'fix_price') ? display['get_at_text']+" "+currency_symbol+""+price : price+"%")
            if(value == level[key-1]){
              levels_html += "<tr><td>"+quantity+" + " + "</td><td><span class='hulkapps-price'>"+discount+"</span></td></tr>"
            }else{
               var second_qty = (quantity)? (level[key+1]) ? level[key+1][0] - 1 : '+' : ''
              levels_html += "<tr><td>"+quantity+"-"+ second_qty+"</td><td><span class='hulkapps-price'>"+discount+"</span></td></tr>"
            }
          }
        });
      }
      levels_html += "</tbody></table></div><style>.hulkapps-table thead {background-color: "+display['header_bg_color']+";font-size: "+display['header_font_size']+"px;color: "+display['header_text_color']+";}.hulkapps-table tbody {background-color: "+display['body_bg_color']+";font-size: "+display['body_font_size']+"px;color: "+display['body_text_color']+"}.hulkapps-table th,.hulkapps-table td{border: "+display['grid_border_width']+"px solid "+display['border_color']+" !important;padding:8px 15px !important; }.hulkapps-table .hulkapps-price{color: "+display['discount_text_color']+"}.hulkapps-volumes {width: 100%;margin-top: 10px;}"+display['custom_css']+"</style><script>"+display['custom_js']+"</script>"
      return levels_html
    }
    window.hulkappsStart = function($) {
      window.hulkappsc = {};
      setTimeout(function() {
        window.hulkappsc.$first_add_to_cart_el = null;
        var selectors = ["input[name='add']", "button[name='add']", "#add-to-cart", "#AddToCartText", "#AddToCart"];
        var found_selectors = 0;
        selectors.forEach(function(selector) {
          found_selectors += $(selector).length;
          if (window.hulkappsc.$first_add_to_cart_el == null && found_selectors) {
            window.hulkappsc.$first_add_to_cart_el = $(selector).first()
          }
        });
        if (window.hulkapps.page_type == "product" && window.hulkappsc.$first_add_to_cart_el != null) {
          var vol_el_after = window.hulkappsc.$first_add_to_cart_el;
          if(vol_el_after.parent().is("div")) {
            vol_el_after = vol_el_after.parent()
          }
          if($(".hulkapps-volumes").length == 0){
            vol_el_after.after('<div class="hulkapps-volumes"></div>');
          }
          if($('#hulkapps_custom_options_'+window.hulkapps.product_id).length == 0){
            vol_el_after.before('<div id="hulkapps_custom_options_'+window.hulkapps.product_id+'"></div>');
          }
        }
        if(window.hulkapps.page_type == "product"){
          if(window.hulkapps.is_volume_discount){
            product_page_btn_condition();
            
            var selector_var = document.querySelectorAll(".single-option-selector,.swatch-element input[type='radio'],.single-option-selector__radio, select[data-option='option1'], select[data-option='option1']:checked, select[data-option='option2'], select[data-option='option1']:checked, select[data-option='option3'], select[data-option='option3']:checked, select[data-index='option1'], select[data-index='option1']:checked, select[data-index='option2'], select[data-index='option1']:checked, select[data-index='option3'], select[data-index='option3']:checked, ul li div[swatch-option='option1'], input[type='radio']:checked")
            selector_var.forEach(function(selector) {
              selector.addEventListener('change',(event) => {
                product_page_btn_condition();
                if(window.hulkapps.customer){
                  data = { pid : window.hulkapps.product_id, store_id : window.hulkapps.store_id, ctags: window.hulkapps.customer.tags, product_variants: window.hulkapps.product.selected_variant, product_collections: window.hulkapps.product_collections}
                }else{
                  data = { pid : window.hulkapps.product_id, store_id : window.hulkapps.store_id, product_variants: window.hulkapps.product.selected_variant, product_collections: window.hulkapps.product_collections}
                }
                $.ajax({
                    type:"POST",
                    url: window.hulkapps.vd_url+"/api/v2/shop/get_offer_table",
                    data : data,
                    crossDomain: true,
                    success:function(data){
                      if(data){
                        var html_text = eligible_offer(data)
                        writeCookie("vd_"+window.hulkapps.product_id,data,1);
                        $('.hulkapps-volumes').html(html_text);
                      }else{
                         $('.hulkapps-volumes').html("");
                      }
                      
                    }
                  });
              });
            });
            
            $(document).on('click', '.close_banner', function(event) {
              $('.hulkapps-banner-msg').remove();
            });
            if(window.hulkapps.customer){
              data = { pid : window.hulkapps.product_id, store_id : window.hulkapps.store_id, ctags: window.hulkapps.customer.tags, product_variants: window.hulkapps.product.selected_variant, product_collections: window.hulkapps.product_collections}
            }else{
              data = { pid : window.hulkapps.product_id, store_id : window.hulkapps.store_id, product_variants: window.hulkapps.product.selected_variant, product_collections: window.hulkapps.product_collections}
            }
            var offer_table = readCookie("vd_"+window.hulkapps.product_id);
            if(offer_table != '' && offer_table != null && typeof offer_table !== 'undefined'){
              $('.hulkapps-volumes').html(readCookie("vd_"+window.hulkapps.product_id));
            }else{
              $.ajax({
                type:"POST",
                url: window.hulkapps.vd_url+"/api/v2/shop/get_offer_table",
                data : data,
                crossDomain: true,
                success:function(data){
                  if(data){
                    var html_text = eligible_offer(data)
                    writeCookie("vd_"+window.hulkapps.product_id,data,1);
                    $('.hulkapps-volumes').html(html_text);
                  }else{
                    $('.hulkapps-volumes').html("");
                  }
                  
                }
              });
            } 
          }
          if(window.hulkapps.is_product_option){
            $.ajax({
              type:"GET",
              url: window.hulkapps.po_url+"/api/v2/store/get_all_relationships",
              data : { pid : window.hulkapps.product_id,store_id : window.hulkapps.store_id},
              sync: false,
              crossDomain: true,
              success:function(data){
                if($.type(data) != 'string'){
                  setTimeout(function(){
                    var conditional_html = ''
                    if(data['condition'] != undefined){
                      conditional_html += "<div id='conditional_rules' style='display:none'>"
                      $.each(data['condition'], function(index, con){
                        var condition_id = con['id']
                        var conditions = jQuery.parseJSON(con['conditions'])
                        if(conditions['apply_rule'] == 'OR'){
                          var apply_rule  = "0" 
                        }else{
                          var apply_rule  = "1" 
                        }
                        conditional_html = conditional_html + "<div id='conditional_logic_"+condition_id+"' name='conditional_logic_"+condition_id+"' data-verify-all='"+apply_rule+"' style='display:none'>"
                        $.each(conditions['rules'], function(index, rule){
                          var option_id = parseInt(rule['option']);
                          if(data['option_id_array'].indexOf(option_id) >= 0){
                            if(parseInt(rule['rule_type']) == 1){
                              var rule_type  = "==" 
                            }else{
                              var rule_type  = "!=" 
                            }
                            conditional_html = conditional_html + "<div name='conditional_logic_"+condition_id+"' data-field-num='"+option_id+"' data-verify-all='"+apply_rule+"' class='step_1'>**value11**"+rule_type+""+rule['option_val']+"</div>"
                          }
                        });
                        conditional_html = conditional_html + "</div>"
                        $.each(conditions['actions'], function(index, action){
                          var option_id = parseInt(action['option']);
                          if(data['option_id_array'].indexOf(option_id) >= 0){
                            if(parseInt(action['action_type']) == 1){
                              var action_type  = "show" 
                            }else{
                              var action_type  = "hide" 
                            }
                            var conclass = "condition_"+action_type+" conditional_logic_"+condition_id+"_"+action_type+" conditional"
                            data['hide_show_array'][option_id] = conclass;
                          }
                        });
                      });
                      conditional_html = conditional_html + "</div>"
                    }
                    var title_text = data['options_title']['title_text'].length != 0 ? data['options_title']['title_text'] : 'Choose Your Product Options:';
                    
                    var ho_title=".hulkapps_option_title{"
                    ho_title = ho_title + ((data['options_title']['title_padding'].length != 0)  ? "padding: "+data['options_title']['title_padding']+"px;" : 'padding: 15px;')
                    ho_title = ho_title + ((data['options_title']['title_font_size'].length != 0) ? "font-size: "+data['options_title']['title_font_size']+"px;" : 'font-size: 16px;')
                    ho_title = ho_title + ((data['options_title']['title_text_align'].length != 0) ? "text-align: "+data['options_title']['title_text_align']+";" : 'text-align: left;')
                    ho_title = ho_title + ((data['options_title']['title_background'].length != 0) ? "background-color: "+data['options_title']['title_background']+";" : 'background-color: #ffffff;')
                    ho_title = ho_title + ((data['options_title']['title_border'].length != 0) ? "border: 1px solid "+data['options_title']['title_border']+";" : 'border: 1px solid #000000;')
                    ho_title = ho_title + ((data['options_title']['title_font_color'].length != 0) ? "color: "+data['options_title']['title_font_color']+";" : 'color:#000000;')
                    ho_title = ho_title + ((parseInt(data['options_title']['title_bold'])==1) ? "font-weight:bold;" : 'font-weight:normal;')
                    ho_title = ho_title + ((parseInt(data['options_title']['title_display'])==1) ? "" : 'display:none;')
                    ho_title = ho_title + "border-bottom: none;"
                    ho_title = ho_title + "}"

                    var enable_tooltip = data['options_container_style']['enable_tooltip']
                    var enable_helptext = data['options_container_style']['enable_helptext']
                    var oc_style="#hulkapps_option_list_"+data['pid']+"{"
                    oc_style = oc_style + ((data['options_container_style']['background_color'].length != 0) ? "background-color: "+data['options_container_style']['background_color']+";" : 'background-color: #fff;')
                    oc_style = oc_style + ((data['options_container_style']['border_color'].length != 0) ? "border: 1px solid "+data['options_container_style']['border_color']+";" : 'border: 0 none;')
                    oc_style = oc_style + ((data['options_container_style']['padding'].length != 0) ? "padding: "+data['options_container_style']['padding']+"px;" : 'padding: 10px;')
                    oc_style = oc_style + "}.hulkapps_option {width: 100%;display: block;"
                    oc_style = oc_style + ((data['options_container_style']['spacing_between_options'].length != 0) ? "padding-bottom: #{@spacing_between_options}px;margin-bottom: "+data['options_container_style']['spacing_between_options']+"px;" : 'padding-bottom: 6px;margin-bottom: 6px;')
                    oc_style = oc_style + ((data['options_container_style']['line_between_options'].length != 0) ? "border-bottom: 1px solid "+data['options_container_style']['line_between_options']+";" : '')
                    oc_style = oc_style + "}"

                    var option_name_inline = data['options_name_style']['option_name_inline']
                    var on_style=".hulkapps_option_name {"
                    on_style = on_style + ((data['options_name_style']['option_name_width'].length != 0) ? "width: "+data['options_name_style']['option_name_width']+"px;" : 'width: 180px;')
                    on_style = on_style + ((data['options_name_style']['option_name_font_size'].length != 0) ? "font-size: "+data['options_name_style']['option_name_font_size']+"px;" : 'font-size: 14px;')
                    on_style = on_style + ((data['options_name_style']['option_name_text_align'].length != 0) ? "text-align: "+data['options_name_style']['option_name_text_align']+";" : 'text-align: left;')
                    on_style = on_style + ((data['options_name_style']['font_color'].length != 0) ? "color: "+data['options_name_style']['font_color']+";" : 'color: #424242;')
                    on_style = on_style + ((parseInt(data['options_name_style']['on_title_bold'])==1) ? "font-weight: bold;" : 'font-weight: normal;')
                    on_style = on_style + "display: table-cell;min-width: "+data['options_name_style']['option_name_width']+"px;padding-right: 15px;box-sizing: border-box;-webkit-box-sizing: border-box;-moz-box-sizing: border-box;-ms-box-sizing: border-box;vertical-align: top;}"

                    var ov_padding = data['option_values_style']['ov_padding']
                    var ov_width = data['option_values_style']['ov_width'] 
                    var spacing_left_of_values = data['option_values_style']['spacing_left_of_values']
                    var single_line = data['option_values_style']['single_line']
                    var ov_style=".hulkapps_option_value {"
                    ov_style = ov_style + "width:100%;min-width: 100%;text-align: left;display: table-cell;vertical-align: top;}"
                    ov_style = ov_style +".hulkapps_option .hulkapps_option_value, .pn_render .hulkapps_option_child, .et_render .hulkapps_option_child, .tb_render .hulkapps_option_child, .ta_render .hulkapps_option_child, .fu_render .hulkapps_option_child, .dd_render .hulkapps_option_child, .dd_multi_render .hulkapps_option_child, .nf_render .hulkapps_option_child, .dp_render .hulkapps_option_child{"
                    ov_style = ov_style + ((data['option_values_style']['ov_font_size'].length != 0) ? "font-size: "+data['option_values_style']['ov_font_size']+"px !important;" : '')
                    ov_style = ov_style + ((data['option_values_style']['ov_font_color'].length != 0) ? "color: "+data['option_values_style']['ov_font_color']+" !important;" : '')
                    ov_style = ov_style + ((data['option_values_style']['ov_font_weight'] != undefined) ? "font-weight:bold;" : 'font-weight:normal;')
                    ov_style = ov_style + "}"

                    var custom_js =  data['advanced_users']['custom_js']
                    var custom_css = data['advanced_users']['custom_css'] 

                    var swatch_width = parseInt(data['swatch_settings']['swatch_width']) 
                    var swatch_height = parseInt(data['swatch_settings']['swatch_height']) 
                    var tooltip_position = data['swatch_settings']['tooltip_position'] 
                    var tooltip_contains = data['swatch_settings']['tooltip_contains']
                    var tooltip_display = parseInt(data['swatch_settings']['tooltip_display'])  
                    var round_corners = parseInt(data['swatch_settings']['round_corners'])   
                    var enable_swatch_images = parseInt(data['swatch_settings']['enable_swatch_images']) 
                    var enable_swatch_with_text =  parseInt(data['swatch_settings']['enable_swatch_with_text']) 
                    var swatch_width = (swatch_width == '' || swatch_width < 0 ) ? "width:35px;" : "width:"+swatch_width+"px;"
                    var swatch_height = (swatch_height == '' || swatch_height < 0 ) ? "height:35px;" : "height:"+swatch_height+"px;"
                    var tooltip_position = (tooltip_position == 'top') ? 'top' : 'bottom'
                    var round_corners = (round_corners == 1) ? '-webkit-border-radius: 50%;-moz-border-radius: 50%;border-radius: 50%;' : ''

                    var update_total_text = data['premium_option_settings']['update_total_text']
                    var amount_note_display = (data['premium_option_settings']['amount_note_display'] == undefined ) ? 1 : data['premium_option_settings']['amount_note_display']
                    var post_total_text = data['premium_option_settings']['post_total_text'] 
                    var total_container_background_color = data['premium_option_settings']['total_container_background_color']
                    var total_container_border_color = data['premium_option_settings']['total_container_border_color']
                    var total_container_font_color = data['premium_option_settings']['total_container_font_color']
                    var total_container_price_color = data['premium_option_settings']['total_container_price_color']
                    var po_settings = "#option_total {"
                    po_settings = po_settings + (total_container_background_color !== '' ? "background: none repeat scroll 0 0 "+total_container_background_color+";" : "background: none repeat scroll 0 0 #fff;")
                    po_settings = po_settings + (total_container_border_color !== '' ? "border:1px solid "+total_container_border_color+";" : 'border:1px solid #000000;')
                    po_settings = po_settings + (total_container_font_color !== '' ? "color: "+total_container_font_color+";" : "color: #000;")
                    po_settings = po_settings + "}#formatted_option_total {"
                    po_settings = po_settings + (total_container_price_color !== '' ? "color: "+total_container_price_color+";" : "color: #000;")
                    po_settings = po_settings + "}"
                    var single_inline_css = parseInt(single_line) == 0 ? '0px' : '10px'
                    var other_css = "#hulkapps_custom_options_"+data['pid']+"{clear: both}#hulkapps_options_"+data['pid']+"{margin:15px 0;}#hulkapps_option_list_"+data['pid']+" select{width:100%;padding-top: 12px;padding-bottom: 12px}#hulkapps_option_list_"+data['pid']+" input[type='text']{width:100%;border-radius:0}#hulkapps_option_list_"+data['pid']+" input,#hulkapps_option_list_"+data['pid']+" textarea,#hulkapps_option_list_"+data['pid']+" select{border:1px solid #ddd;box-shadow: none;-webkit-appearance: none;padding: 6px 10px;min-height: 36px;}#hulkapps_option_list_"+data['pid']+" .validation_error{color:#FF0808;background-color:#FFF8F7;border-style:solid;border-width:1px;border-color:#FFCBC9;border-bottom: 1px solid #ffcbc9 !important;padding: 2px 6px;display: inline-block;margin-top: 2px;}#hulkapps_option_list_"+data['pid']+" .validation_error .hulkapps_option_value{color:#FF0808}#hulkapps_option_list_"+data['pid']+" .validation_error .hulkapps_option_name{color:#FF0808} .hulkapps_helptext{color: #000 !important;}.conditional{display:none !important}.hulkapps_full_width{width:100%;font-size:16px !important;padding:5px;display:block;}.hulkapps_check_option,.hulkapps_radio_option{display:block;margin-right:0;font-weight:normal !important;}.single_line .hulkapps_option_value .hulkapps_check_option,.single_line .hulkapps_option_value .hulkapps_radio_option{display:inline-flex !important;margin-right:20px;font-weight:normal; align-items: center; }#hulkapps_option_list_"+data['pid']+" input[type='checkbox']{margin-right: 5px;vertical-align: baseline;min-height:auto; height: auto;display: inline-block !important;-webkit-appearance: checkbox;-moz-appearance: checkbox;appearance: checkbox;}.hulkapps_check_option input[type='checkbox']{margin-right:5px;}#hulkapps_option_list_"+data['pid']+" input[type='radio']{margin-right:5px;vertical-align:baseline;display: none;}i.hulkapps_tooltip_identifier{color:rgb(255, 255, 255);border-radius:12px;font-size:10px;margin-right:6px;margin-left:4px;padding:0px 4px;background:#000000}span.hulkapps_option_name_additional_info{position:relative}span.hulkapps_option_name_additional_info .hulkapps_tool_tip{display:none}span.hulkapps_option_name_additional_info:hover .hulkapps_tool_tip{content:attr(data-additional-info);padding:4px 8px;color:#fff;position:absolute;left:0;bottom:160%;z-index:20px;-moz-border-radius:5px;-webkit-border-radius:5px;border-radius:5px;display:block;background:#000000;width:150px}span.hulkapps_option_name_additional_info:hover:after{display:block}i.hulkapps_tooltip_identifier:before{content:'?';font-style:normal}#formatted_option_total{font-weight:bold;margin:0 7px}.td_render .hulkapps_option_name.full_name{float:none;width:auto}.hulkapps_option.full_width .hulkapps_option_name,.hulkapps_option.full_width .hulkapps_option_value{width:100%;display:block;}.hulkapps_option.full_width .hulkapps_option_name{padding-bottom:5px}.hulkapps_option:after{content:'';clear:both;display:block}.hulkapps_option_name a:link {color: grey;text-decoration: none;font-weight: normal;}.hulkapps_option_name a:hover {color: rgb(93, 156, 236);background: transparent;}.hulkapps_swatch_option .hulkapps_option_child{border: 2px solid #ccc;cursor: pointer;}.hulkapps_mswatch_option .hulkapps_option_child{border: 2px solid #ccc;cursor: pointer;}.hulkapps_swatch_option .swatch_selected{border: 2px solid #00a9a2;}.hulkapps_radio_option .radio_selected{border: 2px solid #0090FA;background:#0090FA;color:#fff;}.radio_div{border: 2px solid #eee;padding: 8px 20px;padding: 6px 12px;}.radio_div:hover{border: 2px solid #0090FA;cursor:pointer;}.tooltip.in{opacity:1 !important;}#option_display_total_format{padding-left:5px;}.hulkapps_swatch_option .tooltip-inner{padding: 0px 5px !important;}.hulkapps_check_option,.hulkapps_radio_option{margin-right:"+single_inline_css+"}.hulkapps_swatch_option,.hulkapps_mswatch_option{ margin-right:10px !important; display: inline-block !important;vertical-align: middle;}.hulkapps-tooltip.tooltip-left-pos .hulkapps-tooltip-inner.swatch-tooltip{left: 0 !important;right: auto !important;}.hulkapps-tooltip.tooltip-left-pos .hulkapps-tooltip-inner.swatch-tooltip:after{right: auto !important;left: 10px !important;}.hulkapps-tooltip.tooltip-right-pos .hulkapps-tooltip-inner.swatch-tooltip{right: 0 !important;left: auto !important;}.hulkapps-tooltip.tooltip-right-pos .hulkapps-tooltip-inner.swatch-tooltip:after{left: auto !important;right: 10px !important;}.hulkapps-tooltip.tooltip-center-pos .hulkapps-tooltip-inner.swatch-tooltip{left: 50% !important;transform: translateX(-50%);}.hulkapps-tooltip.tooltip-center-pos .hulkapps-tooltip-inner.swatch-tooltip:after{left: 50% !important;transform: translateX(-50%);}.phone_number{padding: 6px 10px 6px 50px !important;}#option_total{padding:3px 6px;}.hulkapps_mswatch_option .swatch_selected{border: 2px solid #00a9a2;}.hulkapps-tooltip.tooltip-left-pos .hulkapps-tooltip-inner.multiswatch-tooltip{left: 0 !important;right: auto !important;}.hulkapps-tooltip.tooltip-left-pos .hulkapps-tooltip-inner.multiswatch-tooltip:after{right: auto !important;left: 10px !important;}.hulkapps-tooltip.tooltip-right-pos .hulkapps-tooltip-inner.multiswatch-tooltip{right: 0 !important;left: auto !important;}.hulkapps-tooltip.tooltip-right-pos .hulkapps-tooltip-inner.multiswatch-tooltip:after{left: auto !important;right: 10px !important;}.hulkapps-tooltip.tooltip-center-pos .hulkapps-tooltip-inner.multiswatch-tooltip{left: 50% !important;transform: translateX(-50%);}.hulkapps-tooltip.tooltip-center-pos .hulkapps-tooltip-inner.multiswatch-tooltip:after{left: 50% !important;transform: translateX(-50%);}.hulkapps_swatch_option, .hulkapps_mswatch_option{margin-bottom: 10px !important;}"
                    var all_css = ho_title + oc_style + on_style + ov_style + po_settings + other_css + custom_css
                    var custom_js = "<script>$('.hulkapps_swatch_option, .hulkapps_mswatch_option').mouseover(function() {var x = $(this).find('.hulkapps-tooltip ').position();var right = $(window).width() - x.left - $(this).find('.hulkapps-tooltip ').width();if(x.left < 205){$(this).find('.hulkapps-tooltip ').addClass('tooltip-left-pos');}if(right < 160){$(this).find('.hulkapps-tooltip ').addClass('tooltip-right-pos');}});$(window).width()<=768&&$('.hulkapps-tooltip').each(function(){var t=$(this).position(),i=$(window).width()-t.left-$(this).width(),o=t.left-i;o<50&&o>-50?$(this).addClass('tooltip-center-pos'):t.left<i?$(this).addClass('tooltip-left-pos'):i<t.left&&$(this).addClass('tooltip-right-pos')});"+data['advanced_users']['custom_js']+"</script>"

                    var addtocart_html = "<div id='hulkapps_options_"+data['pid']+"'>"
                    var hidden_fields = ''
                    addtocart_html = addtocart_html + hidden_fields + conditional_html + "<style>" + all_css + "</style>" + custom_js
                    addtocart_html = addtocart_html + "<div class='hulkapps_option_title'>"+title_text+"</div>"
                    addtocart_html = addtocart_html + "<div id='hulkapps_option_list_"+data['pid']+"'>"
                    if(amount_note_display !== '' || parseInt(amount_note_display) == 1){
                      addtocart_html = addtocart_html + "<input type='hidden' id='hulk_amount_dis' value='1'>"
                    }else{
                      addtocart_html = addtocart_html + "<input type='hidden' id='hulk_amount_dis' value='0'>"
                    }
                    var relation = data['relationship']
                    var all_html = ''
                    var all_phone_js = ''
                    if(data['relationship_option'].length != 0){
                      var hulkapps_required_html = "<span class='hulkapps-required'> * </span>"
                      addtocart_html = addtocart_html + "<div class='hulkapps_option_set'>"
                      $.each(data['relationship_option'], function(key, val){
                        var option = parseInt(val[0])
                        var required = val[1]
                        if(data['option_id_array'].indexOf(option) >= 0){
                          var option_name = $.trim(data['option_associative_array'][option]['option_name'])
                          var tooltip_text = $.trim(data['option_associative_array'][option]['tooltip']) 
                          var helptext = $.trim(data['option_associative_array'][option]['helptext'])
                          var tooltip = (tooltip_text.length > 0) ? "<div class='hulkapps-tooltip'><span><img src='https://productoption.hulkapps.com/tooltip.svg' style='width:15px;'></span><div class='hulkapps-tooltip-inner'>"+tooltip_text+"</div></div>" : ''
                          var helptext_html = (helptext.length > 0) ? "<span class='hulkapps_helptext'>"+helptext+"</span>" : ''
                          var option_limit = data['option_associative_array'][option]['extra_field']
                          var option_type = data['option_associative_array'][option]['option_type']
                          var option_id = option
                          var values_json = $.parseJSON(data['option_associative_array'][option]['values_json'])
                          var is_hide_arr = data['hide_show_array'][option_id] ? data['hide_show_array'][option_id] : ''
                          var is_required = required == 'required' ? "required" : ''
                          var is_inline = parseInt(option_name_inline) == 0 ? 'full_width' : ''
                          var is_required_html = required == 'required' ? hulkapps_required_html : ''
                          var is_enabled_tooltip = data['options_container_style']['enable_tooltip']=='1' ? tooltip : ''
                          var is_enable_helptext = enable_helptext=='1' ? "<div>"+helptext_html+"</div>" : ''
                          if(option_type == 'dropdown'){
                            html = "<div class='hulkapps_option dd_render "+is_required+" "+is_inline+" option_type_id_"+option_id+" "+is_hide_arr+"' data-parent-id= "+option_id+">"
                            html += "<div class='hulkapps_option_name'>"+option_name + " " + is_required_html + " " + is_enabled_tooltip + " : " + is_enable_helptext+"</div>"
                            html += "<div class='hulkapps_option_value'>"
                            html += "<select class='hulkapps_option_child hulkapps_option_"+option_id+"_visible hulkapps_full_width hulkapps_dd' data-option-key='dd_"+option_id+"' id='"+option_id+"' name='properties["+option_name+"]'><option value=''>--Choose "+option_name+"--</option>"
                            $.each(values_json, function(index,ovalue){
                              var price = ovalue[1]
                              var vp1=(price != null && price != "" ) ? " [ "+data['currency_symbol']+price+" ]" : ""
                              var vp2=(price != null && price != "") ? "(+"+data['currency_symbol']+price+")" : ""
                              var vprice=(price != null && price != "") ? price:'0.00'
                              var default_value = (ovalue[4] != undefined) ? ovalue[4] : ovalue[2]
                              var selectedopt = (default_value == true) ? "selected" : ''
                              var opt_class = vprice != '' ? 'price-change' : ''
                              html = html + "<option class='"+opt_class+"' "+selectedopt+" data-price='"+vprice+"' data-conditional-value='"+ovalue[0].toString().trim()+"' value='"+ovalue[0].toString().trim()+vp1+"'>"+ovalue[0].toString().trim()+vp2+"</option>"
                            });
                            html += "</select><script>$(document).on('change','#hulkapps_option_list_"+data['pid']+" #"+option_id+"', function() {conditional_rules("+data['pid']+");if($('#hulk_amount_dis').val() == '1'){calc_options_total("+data['pid']+");}validate_single_option('option_type_id_"+option_id+"','dd_render');});</script></div></div>"
                            all_html = all_html + html
                          }else if(option_type=='dropdown_multiple'){
                            var min_selection = option_limit != undefined && option_limit != '' && option_limit['minimum_selection'] != '' && option_limit['minimum_selection'] != undefined ? option_limit['minimum_selection'].toString() : '0'
                            var max_selection = option_limit != undefined && option_limit != '' && option_limit['maximum_selection'] != '' && option_limit['maximum_selection'] != undefined ? option_limit['maximum_selection'].toString() : '0'
                            var selection_text = (min_selection != '0' && max_selection != '0' && checkPlan('validation_for_min_max_option_selection','boolean',data['plan_id'], data['plans_features'])) ? '[Choose from '+ min_selection +' to '+ max_selection +' values]' : (min_selection != '0' && checkPlan('validation_for_min_max_option_selection','boolean',data['plan_id'], data['plans_features'])) ? '[Choose atleast '+ min_selection +' values]' : (max_selection != '0' && checkPlan('validation_for_min_max_option_selection','boolean',data['plan_id'], data['plans_features'])) ? '[Choose upto '+ max_selection +' values]': ''
                            var html = "<div class='hulkapps_option dd_multi_render "+is_required+" " + is_inline + "  option_type_id_"+option_id+" "+is_hide_arr+"' data-parent-id='"+option_id+"'>"
                            var data_min = min_selection != undefined ? min_selection : ''
                            var data_max = max_selection != undefined ? max_selection : ''
                            html += "<div class='hulkapps_option_name'><div>"+option_name + " " + is_required_html + " " + is_enabled_tooltip + " : </div>"+ selection_text + is_enable_helptext +"</div>"
                            html += "<div class='hulkapps_option_value'>"
                            html += "<select multiple class='hulkapps_option_child hulkapps_option_"+option_id+"_visible hulkapps_full_width hulkapps_dd' data-option-key='dd_"+option_id+"' id='"+option_id+"' name='hulkapps_multiple_dropdown' style='background:none;' data-min='"+min_selection+"' data-max='"+max_selection+"'>"
                            var valueofhiddenprop = []
                            var default_count = 0
                            $.each(values_json, function(index,ovalue){
                              var price = ovalue[1]
                              var vp1=(price != null && price != "") ? " [ "+data['currency_symbol']+price+" ]" : ""
                              var vp2=(price != null && price != "") ? "(+"+data['currency_symbol']+price+")" : ""
                              var vprice=(price != null && price != "") ? price :'0.00'
                              var default_value = (ovalue[4] != undefined) ? ovalue[4] : ovalue[2]
                              if(default_value == true ){
                                default_count += 1
                                valueofhiddenprop.push(ovalue[0].toString().trim()+vp1)
                              }
                              var selectedopt = (default_value == true) ? "selected" : ''
                              var opt_class = vprice != '' ? 'price-change' : ''
                              html = html + "<option class='"+opt_class+"' "+selectedopt+" data-price='"+vprice+"' data-conditional-value='"+ovalue[0].toString().trim()+"' value='"+ovalue[0].toString().trim()+vp1+"'>"+ovalue[0].toString().trim()+vp2+"</option>"
                            });
                            if(default_count > 0){
                              if (min_selection != '0' && max_selection != '0' && checkPlan('validation_for_min_max_option_selection','boolean',data['plan_id'], data['plans_features'])){
                                if (parseInt(default_count) < parseInt(min_selection) || parseInt(default_count) > parseInt(max_selection)){
                                  html += "</select><span class=\"validation_error error_span\">Choose from "+min_selection+" to "+max_selection+" values</span>"
                                }
                              }
                              else if(min_selection != '0'  && max_selection == '0' && checkPlan('validation_for_min_max_option_selection','boolean',data['plan_id'], data['plans_features'])){
                                if (parseInt(default_count) < parseInt(min_selection)){
                                  html += "</select><span class=\"validation_error error_span\">Choose atleast "+min_selection+" values</span>"
                                }
                              }
                              else if(min_selection == '0'  && max_selection != '0' && checkPlan('validation_for_min_max_option_selection','boolean',data['plan_id'], data['plans_features'])){
                                if (parseInt(default_count) > parseInt(max_selection)){
                                  html += "</select><span class=\"validation_error error_span\">Choose upto "+max_selection+" values</span>"
                                }
                              }
                            }
                            var validation_error = '<span class=\"validation_error error_span\" >'
                            html += "<input class='hulkapps_option_child' type='hidden' value='"+valueofhiddenprop.join(', ')+"' id='hulkapps_option_"+option_id+"_hidden' name='properties["+option_name+"]'><script>$(document).on('change','#hulkapps_option_list_"+data['pid']+" #"+option_id+"', function() {if (("+min_selection+" != 0) && ("+max_selection+" != 0) && (checkPlan('validation_for_min_max_option_selection','boolean',"+data['plan_id']+","+data['plans_features']+"))) {if ($(this).find('option:selected').length < '"+min_selection+"') {$(this).parents('.hulkapps_option').removeClass('validation_error').find('.error_span').remove();$(this).parents('.hulkapps_option').find('.hulkapps_option_value #"+option_id+"').after('"+validation_error+"Choose from "+min_selection+" to "+max_selection+" values</span>');if ($(this).find('option:selected').length == 0) {$(this).parents('.hulkapps_option').removeClass('validation_error').find('.error_span').remove();}} else if ($(this).find('option:selected').length > "+max_selection+") {$('#"+option_id+" option:selected:last').prop('selected',false);$(this).parents('.hulkapps_option').removeClass('validation_error').find('.error_span').remove();$(this).parents('.hulkapps_option').find('.hulkapps_option_value #"+option_id+"').after('"+validation_error+"Choose from "+min_selection+" to "+max_selection+" values</span>');if ($(this).find('option:selected').length == '"+max_selection+"') {$(this).parents('.hulkapps_option').removeClass('validation_error').find('.error_span').remove();}} else {$(this).parents('.hulkapps_option').removeClass('validation_error').find('.error_span').remove();}} else if ((checkPlan('validation_for_min_max_option_selection','boolean',"+data['plan_id']+","+data['plans_features']+")) && "+min_selection+" != 0) {if ($(this).find('option:selected').length < '"+min_selection+"') {$(this).parents('.hulkapps_option').removeClass('validation_error').find('.error_span').remove();$(this).parents('.hulkapps_option').find('.hulkapps_option_value #"+option_id+"').after('"+validation_error+"Choose atleast "+min_selection+" values</span>');} else {$(this).parents('.hulkapps_option').removeClass('validation_error').find('.error_span').remove();}} else if ((checkPlan('validation_for_min_max_option_selection','boolean',"+data['plan_id']+","+data['plans_features']+")) && "+max_selection+" != 0) {if ('"+max_selection+"' >= $(this).find('option:selected').length) {if ('"+max_selection+"' == $(this).find('option:selected').length) {$(this).parents('.hulkapps_option').removeClass('validation_error').find('.error_span').remove();} else {$(this).parents('.hulkapps_option').removeClass('validation_error').find('.error_span').remove();$(this).parents('.hulkapps_option').find('.hulkapps_option_value #"+option_id+"').after('"+validation_error+"Choose upto "+max_selection+" values</span>');}} else {$(this).parents('.hulkapps_option').removeClass('validation_error').find('.error_span').remove();$('#"+option_id+" option:selected:last').prop('selected',false);}} else {$(this).parents('.hulkapps_option').removeClass('validation_error');}var chkMulti = $.map($('.hulkapps_option_"+option_id+"_visible :selected'), function(el, i) {return $(el).val();});$('#hulkapps_option_"+option_id+"_hidden').val(chkMulti.join(', '));conditional_rules("+data['pid']+");if($('#hulk_amount_dis').val() == '1'){calc_options_total("+data['pid']+");}validate_single_option('option_type_id_"+option_id+"', 'dd_multi_render');});</script></div></div>"
                            all_html = all_html + html
                          }else if(option_type=='swatch'){
                            var swatchcount=0
                            var html = "<div class='hulkapps_option swatch_render "+is_required + " " + is_inline + " option_type_id_"+option_id+" "+is_hide_arr+"' data-parent-id='"+option_id+"' >"
                            html += "<div class='hulkapps_option_name'>"+option_name + " " + is_required_html + " " + is_enabled_tooltip + " : " + is_enable_helptext+"</div>"
                            html += "<div class='hulkapps_option_value'>"
                            $.each(values_json, function(index,ovalue){
                              var price = ovalue[1]
                              var swatch_text = (ovalue[0] != '') ? ovalue[0]:''
                              var swatch_type = (ovalue[2] != '') ? ovalue[2]:''
                              var swatch_val =  (ovalue[3] != '') ? ovalue[3]:''
                              var vp1=(price != null && price != "") ? " [ "+data['currency_symbol']+price+" ]" : ""
                              var vp=(price != null && price != "") ? "(+"+data['currency_symbol']+price+")" : ""
                              var vprice=(price != null && price != "") ? price:'0.00'
                              var opt_class = vprice != '' ? 'price-change' : ''
                              var default_value = (ovalue[6] != undefined) ? ovalue[6] : ovalue[4]
                              var selectedopt = (default_value == true) ? "swatch_selected" : ''
                              var checkdopt = (default_value == true) ? "checked" : ''
                              var swatch_title = "<p>"+ovalue[0]+" <br> "+vp+"</p>"
                              var s_image = ''
                              if(swatch_type=='image'){
                                swatch_style="background-image:url("+swatch_val+"); background-size:cover;background-position: center center;"+round_corners+""
                                swatch_image="data-image='"+swatch_val+"'"
                                s_image = swatch_val
                              }else{
                                try {
                                  var swatch_color_option = swatch_val.split(",")
                                }
                                catch(err) {
                                  swatch_color_option = null
                                } 
                                if(swatch_color_option != null){
                                  if(swatch_color_option[1] != undefined){
                                    swatch_color_dual_ton = "background: linear-gradient(to bottom, "+swatch_color_option[0]+" 0%, "+swatch_color_option[0]+" 50%, "+swatch_color_option[1]+" 50%, "+swatch_color_option[1]+" 100%); "+round_corners+""
                                    var swatch_style=swatch_color_dual_ton
                                    var swatch_image="data-image=''"
                                  }else{
                                    var swatch_style="background-color:"+swatch_color_option[0]+";"+round_corners+""
                                    var swatch_image="data-image=''"
                                  }
                                }
                              }
                              if(swatch_title != undefined){
                                if(swatch_val != undefined){
                                  if(tooltip_contains=="both"){
                                    var titlee ="<div style='text-align:center;'><div class='swatch_tooltip_title'> "+ swatch_title + "</div><div class='swatch_tooltip_data' style='width:100%;padding-top:100%;" + swatch_style + "'></div></div>"
                                  }else if(tooltip_contains=="image_only"){
                                    titlee ="<div style='text-align:center;'><div class='swatch_tooltip_data' style='width:100%;padding-top:100%;" + swatch_style + "'></div></div>"
                                  }else{
                                    titlee = "<div style='text-align:center;'><div class='swatch_tooltip_title'> "+ swatch_title + "</div></div>"
                                  }
                                }else{
                                  titlee ="<div style='text-align:center;'><div class='swatch_tooltip_title'> "+ swatch_title + "</div></div>"
                                }
                              }else{
                                 titlee = "<div style='text-align:center;'><div class='swatch_tooltip_title'></div></div>"
                              }
                              tooltip_val = "<div class='hulkapps-tooltip-inner swatch-tooltip' style='width:200px;'><div>"+titlee+"</div></div>"
                              tooltip_display_html = parseInt(tooltip_display) == 1 ? tooltip_val : ''
                              swatch_with_text = parseInt(enable_swatch_with_text) == 1 ? swatch_text : ''
                              html += "<label class='hulkapps_swatch_option'><div class='hulkapps-tooltip "+tooltip_position+"'>"+tooltip_display_html+"<div><div id='"+option_id+"_"+swatchcount+"' data-option-key='rb_"+option_id+"_"+swatchcount+"' class='hulkapps_option_child "+selectedopt+" hulkapps_option_"+option_id+" "+opt_class+" '  data-price='"+vprice+"' data-conditional-value='"+ovalue[0].toString().trim()+"' value='"+ovalue[0].toString().trim()+"' style='"+swatch_width + swatch_height + swatch_style+"' "+tooltip_position+"><input type='radio' name='properties["+option_name+"]' value='"+ovalue[0].toString().trim()+vp1+"' class='swatch_radio' "+checkdopt+" style='display:none;' "+swatch_image+" ></div></div></div><div style='display: inline-block;vertical-align: middle;margin-left: 5px;'>"+swatch_with_text+"</div></label>"
                              swatchcount += 1
                            });
                            html += "<script>$('.hulkapps_option_"+option_id+"').on('touchend', function(event) {$(this).click();});$('.hulkapps_option_"+option_id+"').click(function (){"
                            if(enable_swatch_images == 1){
                              html += "var swatch_image_url = "+$(this).find('.swatch_radio').attr('data-image')+"if ("+swatch_image_url+" != ''){$('.hulkapps_swatch_image_change img').attr('src',"+swatch_image_url+");$('.hulkapps_swatch_image_change img').attr('srcset',"+swatch_image_url+");$('.hulkapps_swatch_image_change img').attr('data-srcset',"+swatch_image_url+");}"
                            }
                            html += "$(this).find('swatch_radio').prop('checked', true);$(this).parents('.swatch_render').find('.swatch_selected').removeClass('swatch_selected');$(this).addClass('swatch_selected');conditional_rules("+data['pid']+");if($('#hulk_amount_dis').val() == '1'){calc_options_total("+data['pid']+");}validate_single_option('option_type_id_"+option_id+"','swatch_render');});</script></div></div>"
                            all_html = all_html + html
                          }else if(option_type=='swatch_multiple'){
                            var min_selection = option_limit != undefined && option_limit['minimum_selection'] != undefined && option_limit != '' && option_limit['minimum_selection'] != '' ? option_limit['minimum_selection'].toString() : '0'
                            var max_selection = option_limit != undefined  && option_limit['maximum_selection'] != undefined && option_limit != ''  && option_limit['maximum_selection'] != '' ? option_limit['maximum_selection'].toString() : '0'
                            var swatchcount=0
                            var selection_text = (min_selection != '0' && max_selection != '0' && checkPlan('validation_for_min_max_option_selection','boolean',data['plan_id'], data['plans_features'])) ? '[Choose from '+ min_selection +' to '+ max_selection +' values]' : (min_selection != '0' && checkPlan('validation_for_min_max_option_selection','boolean',data['plan_id'], data['plans_features'])) ? '[Choose atleast '+ min_selection +' values]' : (max_selection != '0' && checkPlan('validation_for_min_max_option_selection','boolean',data['plan_id'], data['plans_features'])) ? '[Choose upto '+ max_selection +' values]': ''
                            var html = "<div class='hulkapps_option multiswatch_render "+is_required + " " + is_inline + " option_type_id_"+option_id+" "+is_hide_arr+"' data-parent-id='"+option_id+"' >"
                            html += "<div class='hulkapps_option_name'><div>"+option_name + " " + is_required_html + " " + is_enabled_tooltip + " : " +"</div> "+selection_text+" "+is_enable_helptext+"</div>"
                            html += "<div class='hulkapps_option_value'>"
                            var valueofhiddenprop = []
                            var default_count = 0

                            $.each(values_json, function(index,ovalue){
                              var price = ovalue[1]
                              var swatch_text = (ovalue[0] != '') ? ovalue[0]:''
                              var swatch_type = (ovalue[2] != '') ? ovalue[2]:''
                              var swatch_val =  (ovalue[3] != '') ? ovalue[3]:''
                              var vp1=(price != null && price != "") ? " [ "+data['currency_symbol']+price+" ]" : ""
                              var vp=(price != null && price != "") ? "(+"+data['currency_symbol']+price+")" : ""
                              var vprice=(price != null && price != "") ? price:'0.00'
                              var opt_class = vprice != '' ? 'price-change' : ''
                              var default_value = (ovalue[6] != undefined) ? ovalue[6] : ovalue[4]
                              if(default_value == true){
                                default_count += 1
                                valueofhiddenprop.push(ovalue[0].toString().trim()+vp1)
                              }
                              var selectedopt = (default_value == true) ? "swatch_selected" : ''
                              var checkdopt = (default_value == true) ? "checked" : ''
                              var swatch_title = "<p>"+ovalue[0]+" <br> "+vp+"</p>"
                              var s_image = ''
                              if(swatch_type=='image'){
                                swatch_style="background-image:url("+swatch_val+");background-size:cover;background-position: center center;"+round_corners+""
                                swatch_image="data-image='"+swatch_val+"'"
                                s_image = swatch_val
                              }else{

                                try {
                                  var swatch_color_option = swatch_val.split(",")
                                }
                                catch(err) {
                                  swatch_color_option = null
                                } 
                                if(swatch_color_option != null){
                                  if(swatch_color_option[1] != null){
                                    swatch_color_dual_ton = "background: linear-gradient(to bottom, "+swatch_color_option[0]+" 0%, "+swatch_color_option[0]+" 50%, "+swatch_color_option[1]+" 50%, "+swatch_color_option[1]+" 100%); "+round_corners+""
                                    var swatch_style=swatch_color_dual_ton
                                    var swatch_image="data-image=''"
                                  }else{
                                    var swatch_style="background-color:"+swatch_color_option[0]+";"+round_corners+""
                                    var swatch_image="data-image=''"
                                  }
                                }
                              }
                              if(swatch_title != undefined){
                                if(swatch_val != ''){
                                  if(tooltip_contains=="both"){
                                    var titlee ="<div style='text-align:center;'><div class='multiswatch_tooltip_title'> "+ swatch_title + "</div><div class='multiswatch_tooltip_data' style='width:100%;padding-top:100%;" + swatch_style + "'></div></div>"
                                  }else if(tooltip_contains=="image_only"){
                                    titlee ="<div style='text-align:center;'><div class='multiswatch_tooltip_data' style='width:100%;padding-top:100%;" + swatch_style + "'></div></div>"
                                  }else{
                                    titlee = "<div style='text-align:center;'><div class='multiswatch_tooltip_title'> "+ swatch_title + "</div></div>"
                                  }
                                }else{
                                  titlee ="<div style='text-align:center;'><div class='multiswatch_tooltip_title'> "+ swatch_title + "</div></div>"
                                }
                              }else{
                                 titlee = "<div style='text-align:center;'><div class='swatch_tooltip_title'></div></div>"
                              }
                              tooltip_val = "<div class='hulkapps-tooltip-inner multiswatch-tooltip' style='width:200px;'><div>"+titlee+"</div></div>"
                              tooltip_display_html = parseInt(tooltip_display) == 1 ? tooltip_val : ''
                              swatch_with_text = parseInt(enable_swatch_with_text) == 1 ? swatch_text : ''
                              html += "<label class='hulkapps_mswatch_option'><div class='hulkapps-tooltip "+tooltip_position+"'>"+tooltip_display_html+"<div><div id='"+option_id+"_"+swatchcount+"' data-option-key='rb_"+option_id+"_"+swatchcount+"' class='hulkapps_option_child "+selectedopt+" hulkapps_option_"+option_id+" "+opt_class+"'  data-price="+vprice+" data-conditional-value='"+ovalue[0].toString().trim()+"' value='"+ovalue[0].toString().trim()+"' style='"+swatch_width + swatch_height + swatch_style+"' "+tooltip_position+"><input type='checkbox' data-conditional-value='"+ovalue[0].toString().trim()+"' data-price="+vprice+" id='"+option_id+"' value='"+ovalue[0].toString().trim()+vp1+"' class='swatch_checkbox hulkapps_option_child hulkapps_option_"+option_id+"_visible "+opt_class+"' "+checkdopt+" style='display:none !important;' "+swatch_image+" ></div></div></div><div style='display: inline-block;vertical-align: middle;margin-left: 5px;'>"+swatch_with_text+"</div></label>"
                              swatchcount += 1
                            });
                            if(enable_swatch_images == 1){
                              html += "var swatch_image_url = "+$(this).find('.swatch_radio').attr('data-image')+"if ("+swatch_image_url+" != ''){$('.hulkapps_swatch_image_change img').attr('src',"+swatch_image_url+");$('.hulkapps_swatch_image_change img').attr('srcset',"+swatch_image_url+");$('.hulkapps_swatch_image_change img').attr('data-srcset',"+swatch_image_url+");}"
                            }
                            if(default_count > 0){
                              if (min_selection != '0' && max_selection != '0' && checkPlan('validation_for_min_max_option_selection','boolean',data['plan_id'], data['plans_features'])){
                                if (parseInt(default_count) < parseInt(min_selection) || parseInt(default_count) > parseInt(max_selection)){
                                  html += "<span class=\"validation_error error_span\">Choose from "+min_selection+" to "+max_selection+" values</span>"
                                }
                              }
                              else if(min_selection != '0'  && max_selection == '0' && checkPlan('validation_for_min_max_option_selection','boolean',data['plan_id'], data['plans_features'])){
                                if (parseInt(default_count) < parseInt(min_selection)){
                                  html += "<span class=\"validation_error error_span\">Choose atleast "+min_selection+" values</span>"
                                }
                              }
                              else if(min_selection == '0'  && max_selection != '0' && checkPlan('validation_for_min_max_option_selection','boolean',data['plan_id'], data['plans_features'])){
                                if (parseInt(default_count) > parseInt(max_selection)){
                                  html += "<span class=\"validation_error error_span\">Choose upto "+max_selection+" values</span>"
                                }
                              }
                            }
                            var validation_error = '<span class=\"validation_error error_span\" >'
                            html += "<input class='hulkapps_option_child' value='"+valueofhiddenprop.join(', ')+"' type='hidden' id='hulkapps_option_"+option_id+"_hidden' name='properties["+option_name+"]'><script>$(document).on('click','.hulkapps_option_"+option_id+"', function() {$(this).addClass('swatch_selected');if (("+min_selection+" != 0) && ("+max_selection+" != 0) && (checkPlan('validation_for_min_max_option_selection','boolean',"+data['plan_id']+","+data['plans_features']+"))) {if (($('.hulkapps_option_"+option_id+"_visible:checkbox:checked').length) < parseInt('"+min_selection+"')) {$(this).parents('.hulkapps_option').removeClass('validation_error').find('.error_span').remove();$(this).parents('.hulkapps_option').append('"+validation_error+"Choose from "+min_selection+" to "+max_selection+" values</span>');if (($('.hulkapps_option_"+option_id+"_visible:checkbox:checked').length) == 0) {$(this).parents('.hulkapps_option').removeClass('validation_error').find('.error_span').remove();}} else if (($('.hulkapps_option_"+option_id+"_visible:checkbox:checked').length) > parseInt('"+max_selection+"')) {$(this).parents('.hulkapps_option').removeClass('validation_error').find('.error_span').remove();$(this).parents('.hulkapps_option').append('"+validation_error+"Choose from "+min_selection+" to "+max_selection+" values</span>');if (($('.hulkapps_option_"+option_id+"_visible:checkbox:checked').length) != parseInt('"+max_selection+"')) {$(this).parents('.hulkapps_option').removeClass('validation_error').find('.error_span').remove();}$(this).find(':checkbox').prop('checked', false);} else {$(this).parents('.hulkapps_option').removeClass('validation_error').find('.error_span').remove();}} else if ("+min_selection+" != 0 && (checkPlan('validation_for_min_max_option_selection','boolean',"+data['plan_id']+","+data['plans_features']+"))) {if (($('.hulkapps_option_"+option_id+"_visible:checkbox:checked').length) < parseInt('"+min_selection+"')) {$(this).parents('.hulkapps_option').removeClass('validation_error').find('.error_span').remove();$(this).parents('.hulkapps_option').append('"+validation_error+"Choose atleast "+min_selection+" values</span>');} else {$(this).parents('.hulkapps_option').removeClass('validation_error').find('.error_span').remove();}} else if ("+max_selection+" != 0 && (checkPlan('validation_for_min_max_option_selection','boolean',"+data['plan_id']+","+data['plans_features']+"))) {if (parseInt('"+max_selection+"') >= ($('.hulkapps_option_"+option_id+"_visible:checkbox:checked').length)) {if (parseInt('"+max_selection+"') == ($('.hulkapps_option_"+option_id+"_visible:checkbox:checked').length)) {$(this).parents('.hulkapps_option').removeClass('validation_error').find('.error_span').remove();} else {$(this).parents('.hulkapps_option').removeClass('validation_error').find('.error_span').remove();$(this).parents('.hulkapps_option').append('"+validation_error+"Choose upto "+max_selection+" values</span>');}} else {$(this).parents('.hulkapps_option').removeClass('validation_error').find('.error_span').remove();$(this).find(':checkbox').prop('checked', false);}}conditional_rules("+data['pid']+");var chkMulti = $.map($('.hulkapps_option_"+option_id+"_visible:checked'), function(el, i) {return $(el).val();});$('#hulkapps_option_"+option_id+"_hidden').val(chkMulti.join(',  '));if($('#hulk_amount_dis').val() == '1'){calc_options_total("+data['pid']+");}validate_single_option('option_type_id_"+option_id+"', 'multiswatch_render');});$(document).on('change','.hulkapps_option_"+option_id+"_visible',function(e){$(this).is(':checked')?$(this).parent().addClass('swatch_selected'):$(this).parent().removeClass('swatch_selected')});</script></div></div>"
                            all_html = all_html + html
                          }else if(option_type=='checkbox'){
                            var min_selection = option_limit != undefined && option_limit != '' && option_limit['minimum_selection'] != undefined  && option_limit['minimum_selection'] != '' ? option_limit['minimum_selection'].toString() : '0'
                            var max_selection = option_limit != undefined && option_limit != '' && option_limit['maximum_selection'] != undefined && option_limit['maximum_selection'] != '' ? option_limit['maximum_selection'].toString() : '0'
                            var is_single_line = parseInt(single_line) == 1 ? 'single_line' : ''
                            var selection_text = (min_selection != '0' && max_selection != '0' && checkPlan('validation_for_min_max_option_selection','boolean',data['plan_id'], data['plans_features'])) ? '[Choose from '+ min_selection +' to '+ max_selection +' values]' : (min_selection != '0' && checkPlan('validation_for_min_max_option_selection','boolean',data['plan_id'], data['plans_features'])) ? '[Choose atleast '+ min_selection +' values]' : (max_selection != '0' && checkPlan('validation_for_min_max_option_selection','boolean',data['plan_id'], data['plans_features'])) ? '[Choose upto '+ max_selection +' values]': ''
                            var html = "<div class='hulkapps_option cb_render " +is_required+ " " +is_inline + " " + is_single_line + " " + "option_type_id_"+option_id+" "+is_hide_arr+"' data-parent-id='"+option_id+"' data-min='"+min_selection+"' data-max='"+max_selection+"'>"
                            html += "<div class='hulkapps_option_name'><div>"+option_name + " " + is_required_html + " " + is_enabled_tooltip + " : " +" </div> "+selection_text+" "+is_enable_helptext+"</div>"
                            html += "<div class='hulkapps_option_value'>"
                            var valueofhiddenprop = []
                            var default_count = 0
                            $.each(values_json, function(index,ovalue){
                              var price = ovalue[1]
                              var vp1=(price != null && price != "") ? " [ "+data['currency_symbol']+price+" ]" : ""
                              var vp2=(price != null && price != "") ? "(+"+data['currency_symbol']+price+")" : ""
                              var vprice=(price != null && price != "") ? price:'0.00'
                              var default_value = (ovalue[4] != undefined) ? ovalue[4] : ovalue[2]
                              if(default_value == true){
                                default_count += 1
                                valueofhiddenprop.push(ovalue[0].toString().trim()+vp1)
                              }
                              var selectedopt = (default_value == true) ? "checked" : ''
                              var opt_class = vprice != '' ? 'price-change' : ''
                              html += "<label class='hulkapps_check_option'><input type='checkbox' "+selectedopt+" data-option-key='cbm_"+option_id+"' id='"+option_id+"' class='hulkapps_option_child hulkapps_option_"+option_id+"_visible "+opt_class+"' data-price='"+vprice+"'  data-conditional-value='"+ovalue[0].toString().trim()+"' value='"+ovalue[0].toString().trim()+vp1+"'>"+ovalue[0].toString().trim()+vp2+"</label>"
                            });
                            if(default_count > 0){
                              if (min_selection != '0' && max_selection != '0' && checkPlan('validation_for_min_max_option_selection','boolean',data['plan_id'], data['plans_features'])){
                                if (parseInt(default_count) < parseInt(min_selection) || parseInt(default_count) > parseInt(max_selection)){
                                  html += "</select><span class=\"validation_error error_span\">Choose from "+min_selection+" to "+max_selection+" values</span>"
                                }
                              }
                              else if(min_selection != '0'  && max_selection == '0' && checkPlan('validation_for_min_max_option_selection','boolean',data['plan_id'], data['plans_features'])){
                                if (parseInt(default_count) < parseInt(min_selection)){
                                  html += "</select><span class=\"validation_error error_span\">Choose atleast "+min_selection+" values</span>"
                                }
                              }
                              else if(min_selection == '0'  && max_selection != '0' && checkPlan('validation_for_min_max_option_selection','boolean',data['plan_id'], data['plans_features'])){
                                if (parseInt(default_count) > parseInt(max_selection)){
                                  html += "</select><span class=\"validation_error error_span\">Choose upto "+max_selection+" values</span>"
                                }
                              }
                            }
                            var validation_error = '<span class=\"validation_error error_span\" >'
                            html += "<input class='hulkapps_option_child' value='"+valueofhiddenprop.join(', ')+"' type='hidden' id='hulkapps_option_"+option_id+"_hidden' name='properties["+option_name+"]'><script>$(document).on('click','.hulkapps_option_"+option_id+"_visible', function() {if (("+min_selection+" != 0) && ("+max_selection+" != 0) && (checkPlan('validation_for_min_max_option_selection','boolean',"+data['plan_id']+","+data['plans_features']+"))) {if (($('.hulkapps_option_"+option_id+"_visible:checkbox:checked').length) < parseInt('"+min_selection+"')) {$(this).parents('.hulkapps_option').removeClass('validation_error').find('.error_span').remove();$(this).parents('.hulkapps_option').append('"+validation_error+"Choose from "+min_selection+" to "+max_selection+" values</span>');if (($('.hulkapps_option_"+option_id+"_visible:checkbox:checked').length) == 0) {$(this).parents('.hulkapps_option').removeClass('validation_error').find('.error_span').remove();}} else if (($('.hulkapps_option_"+option_id+"_visible:checkbox:checked').length) > parseInt('"+max_selection+"')) {$(this).parents('.hulkapps_option').removeClass('validation_error').find('.error_span').remove();$(this).parents('.hulkapps_option').append('"+validation_error+"Choose from "+min_selection+" to "+max_selection+" values</span>');if (($('.hulkapps_option_"+option_id+"_visible:checkbox:checked').length) != parseInt('"+max_selection+"')) {$(this).parents('.hulkapps_option').removeClass('validation_error').find('.error_span').remove();}this.checked = false;} else {$(this).parents('.hulkapps_option').removeClass('validation_error').find('.error_span').remove();}} else if ("+min_selection+" != 0 && (checkPlan('validation_for_min_max_option_selection','boolean',"+data['plan_id']+","+data['plans_features']+"))) {if (($('.hulkapps_option_"+option_id+"_visible:checkbox:checked').length) < parseInt('"+min_selection+"')) {$(this).parents('.hulkapps_option').removeClass('validation_error').find('.error_span').remove();$(this).parents('.hulkapps_option').append('"+validation_error+"Choose atleast "+min_selection+" values</span>');} else {$(this).parents('.hulkapps_option').removeClass('validation_error').find('.error_span').remove();}} else if ("+max_selection+" != 0 && (checkPlan('validation_for_min_max_option_selection','boolean',"+data['plan_id']+","+data['plans_features']+"))) {if (parseInt('"+max_selection+"') >= ($('.hulkapps_option_"+option_id+"_visible:checkbox:checked').length)) {if (parseInt('"+max_selection+"') == ($('.hulkapps_option_"+option_id+"_visible:checkbox:checked').length)) {$(this).parents('.hulkapps_option').removeClass('validation_error').find('.error_span').remove();} else {$(this).parents('.hulkapps_option').removeClass('validation_error').find('.error_span').remove();$(this).parents('.hulkapps_option').append('"+validation_error+"Choose upto "+max_selection+" values</span>');}} else {$(this).parents('.hulkapps_option').removeClass('validation_error').find('.error_span').remove();this.checked = false;}}conditional_rules("+data['pid']+");var chkMulti = $.map($('.hulkapps_option_"+option_id+"_visible:checked'), function(el, i) {return $(el).val();});$('#hulkapps_option_"+option_id+"_hidden').val(chkMulti.join(', '));if($('#hulk_amount_dis').val() == '1'){calc_options_total("+data['pid']+");}validate_single_option('option_type_id_"+option_id+"', 'cb_render');});</script></div></div>"

                            all_html = all_html + html
                          }else if(option_type=='textbox'){
                            var cc = ''
                            var is_option_limit = option_limit != undefined && checkPlan('character_limit','boolean',data['plan_id'], data['plans_features']) && option_limit['character_limit'] != '' && option_limit['character_limit'] != undefined ? '[Maximum '+ option_limit['character_limit']+' character]' : ''
                            var html = "<div class='hulkapps_option tb_render "+is_required + " " + is_inline+" option_type_id_"+option_id+" "+is_hide_arr+"' data-parent-id='"+option_id+"'>"
                            html += "<div class='hulkapps_option_name'><div>"+option_name + " " + is_required_html + " " + is_enabled_tooltip+" : </div> "+is_option_limit+" "+is_enable_helptext+"</div>"
                            html += "<div class='hulkapps_option_value'>"
                            $.each(values_json, function(index,ovalue){
                              var price = ovalue[1]
                              var vp1 = (price != null && price != "") ? " [ "+data['currency_symbol']+price+" ]" : ""
                              var vprice=(price != null && price != "") ? price:'0.00'   
                              var maxlength_limit = ''
                              var opt_class = vprice != '' ? 'price-change' : ''
                              if(option_limit != undefined && checkPlan('character_limit','boolean',data['plan_id'], data['plans_features']) && option_limit['character_limit'] != '' && option_limit['character_limit'] != undefined){
                                maxlength_limit = "maxlength="+option_limit['character_limit']+""
                              }
                              html += "<input type='text' data-option-key='tb_"+option_id+"' id='"+option_id+"' class='hulkapps_option_child hulkapps_full_width hulkapps_option_"+option_id+" "+opt_class+"' data-price='"+vprice+"' "+maxlength_limit+"><input type='hidden' name='properties["+option_name+"]' class='tb_property_val'>"
                             if(option_limit != undefined && checkPlan('character_limit','boolean',data['plan_id'], data['plans_features']) && option_limit['character_limit'] != '' && option_limit['character_limit'] != undefined){

                                html += "<input type='hidden' value='"+option_limit['character_limit']+"' class='character_count'><div id='char_count_"+option_id+"'>"+option_limit['character_limit']+ " "+data['display_settings']['charcter_count_message']+"</div>"
                              }
                              cc += "<script>$(document).on('change input','.hulkapps_option_"+option_id+"',function() { var price = $(this).data('price'); var tb_val = $(this).val(); if (tb_val != '') {if(price != '0.00'){var res = tb_val + ' [ "+data['currency_symbol']+"' + price + ' ]';}else{var res = tb_val}$(this).parent().find('.tb_property_val').val(res);$(this).addClass('textbox_selected');}else{$(this).parent().find('.tb_property_val').val('');$(this).removeClass('textbox_selected');}conditional_rules("+data['pid']+");if($('#hulk_amount_dis').val() == '1'){calc_options_total("+data['pid']+");}validate_single_option('option_type_id_"+option_id+"', 'tb_render');});"

                              if(option_limit != undefined && checkPlan('character_limit','boolean',data['plan_id'], data['plans_features']) && option_limit['character_limit'] != '' && option_limit['character_limit'] != undefined){
                                
                                cc += "$(document).on('input', '.hulkapps_option_"+option_id+"', function() { check_character_limit("+option_limit['character_limit']+",'"+option_id+"','"+data['display_settings']['charcter_count_message']+"');});"
                              }
                              cc += "</script>"
                            });
                            html = html + cc + "</div></div>"
                            all_html = all_html + html
                          }else if(option_type=='textarea'){
                            var cc = ''
                            var is_option_limit = option_limit != undefined && checkPlan('character_limit','boolean',data['plan_id'], data['plans_features']) && option_limit['character_limit'] != '' && option_limit['character_limit'] != undefined ? '[Maximum '+ option_limit['character_limit']+' character]' : ''
                            var html = "<div class='hulkapps_option ta_render "+is_required + " " + is_inline+" option_type_id_"+option_id+" "+is_hide_arr+"' data-parent-id='"+option_id+"'>"
                            html += "<div class='hulkapps_option_name'><div>"+option_name + " " + is_required_html + " " + is_enabled_tooltip+" : </div> "+is_option_limit+" "+is_enable_helptext+"</div>"
                            html += "<div class='hulkapps_option_value'>"
                            $.each(values_json, function(index,ovalue){
                              var price = ovalue[1]
                              var vp1 = (price != null && price != "") ? " [ "+data['currency_symbol']+price+" ]" : ""
                              var vprice=(price != null && price != "") ? price:'0.00'   
                              var maxlength_limit = ''
                              var opt_class = vprice != '' ? 'price-change' : ''
                              if(option_limit != undefined && checkPlan('character_limit','boolean',data['plan_id'], data['plans_features'])  && option_limit['character_limit'] != '' && option_limit['character_limit'] != undefined){
                                maxlength_limit = "maxlength="+option_limit['character_limit']+""
                              }
                              html +=  "<textarea data-option-key='ta_"+option_id+"' id='"+option_id+"' class='hulkapps_option_child hulkapps_full_width hulkapps_option_"+option_id+" "+opt_class+"' data-price='"+vprice+"' "+maxlength_limit+"></textarea>"
                              html +=  "<input type='hidden' name='properties["+option_name+"]' class='ta_property_val'>"
                             if(option_limit != undefined && checkPlan('character_limit','boolean',data['plan_id'], data['plans_features']) && option_limit['character_limit'] != '' && option_limit['character_limit'] != undefined){

                                html += "<input type='hidden' value='"+option_limit['character_limit']+"' class='character_count'><div id='char_count_"+option_id+"'>"+option_limit['character_limit']+ " "+data['display_settings']['charcter_count_message']+"</div>"
                              }
                              cc += "<script>$(document).on('change input','.hulkapps_option_"+option_id+"',function() { var price = $(this).data('price'); var ta_val = $(this).val(); if (ta_val != '') {if(price != '0.00'){var res = ta_val + ' [ "+data['currency_symbol']+"' + price + ' ]';}else{var res = ta_val}$(this).parent().find('.ta_property_val').val(res);$(this).addClass('textbox_selected');}else{$(this).parent().find('.ta_property_val').val('');$(this).removeClass('textbox_selected');}conditional_rules("+data['pid']+");if($('#hulk_amount_dis').val() == '1'){calc_options_total("+data['pid']+");}validate_single_option('option_type_id_"+option_id+"', 'ta_render');});"

                              if(option_limit != undefined && checkPlan('character_limit','boolean',data['plan_id'], data['plans_features']) && option_limit['character_limit'] != '' && option_limit['character_limit'] != undefined){
                                
                                cc += "$(document).on('input', '.hulkapps_option_"+option_id+"', function() { check_character_limit("+option_limit['character_limit']+",'"+option_id+"','"+data['display_settings']['charcter_count_message']+"');});"
                              }
                              cc += "</script>"
                            });
                            html = html + cc + "</div></div>"
                            all_html = all_html + html
                          }else if(option_type=='radiobutton'){
                            var rbcount = 0
                            var is_single_line = parseInt(single_line) == 1 ? 'single_line' : ''
                            html =  "<div class='hulkapps_option rb_render "+is_required + " " + is_inline + " " + is_single_line +"  option_type_id_"+option_id+" "+is_hide_arr+"' data-parent-id='"+option_id+"' >"
                            html += "<div class='hulkapps_option_name'>"+option_name+" "+is_required_html+" "+is_enabled_tooltip+" : "+is_enable_helptext+"</div>"
                            html += "<div class='hulkapps_option_value'>"
                            $.each(values_json, function(index,ovalue){
                              var price = ovalue[1]
                              var vp1=(price != null && price != "" ) ? " [ "+data['currency_symbol']+price+" ]" : ""
                              var vp2=(price != null && price != "") ? "(+"+data['currency_symbol']+price+")" : ""
                              var vprice=(price != null && price != "") ? price:'0.00'
                              var default_value = (ovalue[4] != undefined) ? ovalue[4] : ovalue[2]
                              var selectedopt = (default_value == true) ? "radio_selected" : ''
                              var checkdopt = (default_value == true) ? "checked" : ''
                              var opt_class = vprice != '' ? 'price-change' : ''

                              html += "<label class='hulkapps_radio_option'><input id='"+option_id+"_"+rbcount+"' data-option-key='rb_"+option_id+"_"+rbcount+"'  type='radio' "+checkdopt+" class='hulkapps_option_child hulkapps_option_"+option_id+" "+opt_class+" ' data-price='"+vprice+"' data-conditional-value='"+ovalue[0].toString().trim()+"' name='properties["+option_name+"]' value='"+ovalue[0].toString().trim()+vp1+"'><div class='radio_div "+selectedopt+"' for='"+option_id+"_"+rbcount+"'>"+ovalue[0].toString().trim()+vp2+"</div></label>"
                              rbcount += 1
                            });
                            html += "<script>$('.hulkapps_radio_option').on('touchend', function(event) {$(this).find('.hulkapps_option_"+option_id+"').click();});$('.hulkapps_option_"+option_id+"').click(function (){$(this).parent().siblings().find('.radio_div').removeClass('radio_selected');$(this).parent().find('.radio_div').addClass('radio_selected');conditional_rules("+data['pid']+");if($('#hulk_amount_dis').val() == '1'){calc_options_total("+data['pid']+");}validate_single_option('option_type_id_"+option_id+"','rb_render');});</script></div></div>"
                            all_html = all_html + html
                          }else if(option_type=='file_upload'){
                            html = "<div class='hulkapps_option fu_render "+is_required + " " + is_inline +" option_type_id_"+option_id+" "+is_hide_arr+"' data-parent-id='"+option_id+"'>"
                            html += "<div class='hulkapps_option_name'>"+option_name + " " + is_required_html + " " + is_enabled_tooltip +" : "+is_enable_helptext+"</div>"
                            html += "<div class='hulkapps_option_value'><input type='file' data-option-key='fu_"+option_id+"' id='"+option_id+"' class='hulkapps_option_child hulkapps_full_width hulkapps_option_"+option_id+"' name='properties["+option_name+"]'><script>$('#"+option_id+"').change(function (){conditional_rules("+data['pid']+");validate_single_option('option_type_id_"+option_id+"','fu_render');})</script></div></div>"
                            all_html = all_html + html
                          }else if(option_type=='email'){
                            var cc = ''
                            html = "<div class='hulkapps_option et_render "+is_required+" "+is_inline+" option_type_id_"+option_id+" "+is_hide_arr+"' data-parent-id='"+option_id+"'>"
                            html += "<div class='hulkapps_option_name'>"+option_name + " " + is_required_html + " " + is_enabled_tooltip + " : "+is_enable_helptext+" </div>"
                            html += "<div class='hulkapps_option_value'>"
                            $.each(values_json, function(index,ovalue){
                              var price = ovalue[1]
                              var vp1=(price != null && price != "") ? " [ "+data['currency_symbol']+price+" ]" : ""
                              var vp2=(price != null && price != "") ? "(+"+data['currency_symbol']+price+")" : ""
                              var vprice=(price != null && price != "") ? price:'0.00'
                              var default_value = (ovalue[4] != undefined) ? ovalue[4] : ovalue[2]
                              var selectedopt = (default_value == true) ? "selected" : ''
                              var opt_class = vprice != '' ? 'price-change' : ''
                              html += "<input type='email' data-option-key='et_"+option_id+"' id='"+option_id+"' class='hulkapps_option_child hulkapps_full_width hulkapps_option_"+option_id+" "+opt_class+"' data-price='"+vprice+"'><input type='hidden' name='properties["+option_name+"]' class='et_property_val'>"
                              cc += "<script>$(document).on('change','.hulkapps_option_"+option_id+"',function() {var price = $(this).data('price');var et_val = $(this).val();if (et_val != '') {if(price != '0.00'){var res = et_val + ' [ "+data['currency_symbol']+"' + price + ' ]';}else{var res = et_val}$(this).parent().find('.et_property_val').val(res);$(this).addClass('emailbox_selected');}else{ $(this).parent().find('.et_property_val').val('');$(this).removeClass('emailbox_selected');}conditional_rules("+data['pid']+");if($('#hulk_amount_dis').val() == '1'){calc_options_total("+data['pid']+");}validate_single_option('option_type_id_"+option_id+"', 'et_render');});</script>"

                            });
                            html = html + cc + "</div></div>"
                            all_html = all_html + html  
                          }else if(option_type=='date_picker'){
                            var cc = ''
                            html = "<div class='hulkapps_option dp_render "+is_required+" "+is_inline+" option_type_id_"+option_id+" "+is_hide_arr+"' data-parent-id='"+option_id+"'>"
                            html += "<div class='hulkapps_option_name'>"+option_name+" "+is_required_html+" "+is_enabled_tooltip+" : "+is_enable_helptext+"</div>"
                            html += "<div class='hulkapps_option_value'>"
                             $.each(values_json, function(index,ovalue){
                              var price = ovalue[1]
                              var vp1=(price != null && price != "") ? " [ "+data['currency_symbol']+price+" ]" : ""
                              var vp2=(price != null && price != "") ? "(+"+data['currency_symbol']+price+")" : ""
                              var vprice=(price != null && price != "") ? price:'0.00'
                              var default_value = (ovalue[4] != undefined) ? ovalue[4] : ovalue[2]
                              var selectedopt = (default_value == true) ? "selected" : ''
                              var opt_class = vprice != '' ? 'price-change' : ''
                          
                              html += "<input type='text' data-option-key='dp_"+option_id+"' id='"+option_id+"' name='input' placeholder='mm/dd/yyyy' class='hulkapps_option_child hulkapps_full_width hulkapps_option_"+option_id+" "+opt_class+"' data-price='"+vprice+"'><input type='hidden' name='properties["+option_name+"]' class='dp_property_val'>" 
                              cc = cc+"<script>$(document).on('change','.hulkapps_option_"+option_id+"',function() {var price = $(this).data('price');var dp_val = $(this).val();if (dp_val != '') {if(price != '0.00'){var res = dp_val + ' [ "+data['currency_symbol']+"' + price + ' ]';}else{var res = dp_val}$(this).parent().find('.dp_property_val').val(res);$(this).addClass('datepicker_selected');}else{ $(this).parent().find('.dp_property_val').val('');$(this).removeClass('datepicker_selected');}conditional_rules("+data['pid']+");if($('#hulk_amount_dis').val() == '1'){calc_options_total("+data['pid']+");}validate_single_option('option_type_id_"+option_id+"', 'dp_render');});</script>"
                            });
                            html = html + cc + "</div></div>"
                            all_html = all_html + html
                          }else if(option_type=='number_field'){
                            cc = ''
                            var char_limit = option_limit != undefined && checkPlan('character_limit','boolean',data['plan_id'], data['plans_features']) && option_limit['character_limit'] != '' && option_limit['character_limit'] != undefined
                            var is_option_limit = option_limit != undefined && checkPlan('character_limit','boolean',data['plan_id'], data['plans_features']) && option_limit['character_limit'] != '' && option_limit['character_limit'] != undefined  ? '[Maximum '+ option_limit['character_limit']+' character]' : ''
                            var html = "<div class='hulkapps_option nf_render "+is_required + " " + is_inline+" option_type_id_"+option_id+" "+is_hide_arr+"' data-parent-id='"+option_id+"'>"
                            html += "<div class='hulkapps_option_name'><div>"+option_name + " " + is_required_html + " " + is_enabled_tooltip+" : </div> "+is_option_limit+" "+is_enable_helptext+"</div>"
                            html += "<div class='hulkapps_option_value'>"
                            $.each(values_json, function(index,ovalue){
                              var price = ovalue[1]
                              var vp1 = (price != null && price != "") ? " [ "+data['currency_symbol']+price+" ]" : ""
                              var vprice=(price != null && price != "") ? price:'0.00'   
                              var maxlength_limit = ''
                              var length_validation = ''
                              var opt_class = vprice != '' ? 'price-change' : ''
                              if(option_limit != undefined && checkPlan('character_limit','boolean',data['plan_id'], data['plans_features']) && option_limit['character_limit'] != '' && option_limit['character_limit'] != undefined){
                                maxlength_limit = "maxlength="+option_limit['character_limit']+""
                                length_validation = "onKeyPress='if(this.value.length=="+option_limit['character_limit']+") return false;'"
                              }
                              
                              html += "<input type='number' "+length_validation+" pattern='\d*' min=0 step='any' data-option-key='nf_"+option_id+"' id='"+option_id+"' class='hulkapps_option_child hulkapps_full_width hulkapps_option_"+option_id+" "+opt_class+"' data-price='"+vprice+"' "+maxlength_limit+"><input type='hidden' name='properties["+option_name+"]' class='nf_property_val'>"
                             if(option_limit != undefined && checkPlan('character_limit','boolean',data['plan_id'], data['plans_features']) && option_limit['character_limit'] != '' && option_limit['character_limit'] != undefined){
                              html += "<input type='hidden' value='"+option_limit['character_limit']+"' class='character_count'><div id='char_count_"+option_id+"'>"+option_limit['character_limit'] + " " +data['display_settings']['charcter_count_message']+"</div>"
                              }
                             
                              cc += "<script>$(document).on('change input','.hulkapps_option_"+option_id+"',function() { var price = $(this).data('price'); var nf_val = $(this).val(); if (nf_val != '') {if(price != '0.00'){var res = nf_val + ' [ "+data['currency_symbol']+"' + price + ' ]';}else{var res = nf_val}$(this).parent().find('.nf_property_val').val(res);$(this).addClass('numberfield_selected');}else{$(this).parent().find('.nf_property_val').val('');$(this).removeClass('numberfield_selected');}conditional_rules("+data['pid']+");if($('#hulk_amount_dis').val() == '1'){calc_options_total("+data['pid']+");}validate_single_option('option_type_id_"+option_id+"', 'nf_render');});"
                              
                              if(option_limit != undefined && checkPlan('character_limit','boolean',data['plan_id'], data['plans_features']) && option_limit['character_limit'] != '' && option_limit['character_limit'] != undefined){
                                cc += "$(document).on('input', '.hulkapps_option_"+option_id+"', function() { if(this.value.length > Number($(this).attr('maxlength'))){val=this.value.slice(0, $(this).attr('maxlength'));$(this).val(val);}check_character_limit("+option_limit['character_limit']+",'"+option_id+"','"+data['display_settings']['charcter_count_message']+"');});"
                              }
                              cc += "</script>"
                            });
                            html = html + cc + "</div></div>"
                            all_html = all_html + html
                          }else if(option_type=='phone_number'){
                            var cc = ''
                            var phone_option = true
                            var phone_number_js = ''
                            var html = "<div class='hulkapps_option pn_render "+is_required + " " + is_inline+" option_type_id_"+option_id+" "+is_hide_arr+"' data-parent-id='"+option_id+"'>"
                            html += "<div class='hulkapps_option_name'>"+option_name + " " + is_required_html + " " + is_enabled_tooltip +" : "+is_enable_helptext+"</div>"
                            html += "<div class='hulkapps_option_value'>"
                           $.each(values_json, function(index,ovalue){
                              var price = ovalue[1]
                              var vp1 = (price != null && price != "") ? " [ "+data['currency_symbol']+price+" ]" : ""
                              var vprice=(price != null && price != "") ? price:'0.00'   
                              var opt_class = vprice != '' ? 'price-change' : ''
                              html += "<input type='textbox' data-option-key='tb_"+option_id+"' id='"+option_id+"' class='phone_number phone_number"+option_id+" hulkapps_option_child hulkapps_full_width hulkapps_option_"+option_id+" "+opt_class+"' data-price='"+vprice+"'><input type='hidden' name='properties["+option_name+"]' class='tb_property_val'><span id='valid-msg' class='hide'>✓ Valid</span><span id='error-msg' class='hide'>Invalid number</span>"
                              cc  +=  "<script>$(document).ready(function(){$('.phone_number"+option_id+"').keypress(function (e) {if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57)) {return false;}});var telInput = $('.phone_number"+option_id+"');var errorMsg = $('.phone_number"+option_id+"').closest('.hulkapps_option_value').find('#error-msg');var validMsg = $('.phone_number"+option_id+"').closest('.hulkapps_option_value').find('#valid-msg');telInput.intlTelInput({initialCountry: 'auto',geoIpLookup: function(callback) {$.ajax({url: 'https://geoip-db.com/jsonp',jsonpCallback: 'callback',dataType: 'jsonp',success: function(data) {var countryCode = data.country_code;callback(countryCode);}});},customPlaceholder: function(selectedCountryPlaceholder, selectedCountryData) {return 'e.g. ' + selectedCountryPlaceholder;}});var reset = function() {telInput.removeClass('error');errorMsg.innerHTML = '';errorMsg.addClass('hide');validMsg.addClass('hide');};telInput.blur(function() {reset();if ($.trim($('.phone_number"+option_id+"').val())) {if(telInput.intlTelInput('isValidNumber')){validMsg.removeClass('hide');$('.phone_number"+option_id+"').parents('.hulkapps_option_value').find('#error-msg').css('cssText', 'display: none !important');telInput.val(telInput.intlTelInput('getNumber', intlTelInputUtils.numberFormat.E164));var tb_val = $('.phone_number"+option_id+"').val();var price = $(this).data('price');if(price != '0.00'){var res = tb_val + ' [ "+data['currency_symbol']+"' + price + ' ]';}else{var res = tb_val}$(this).parents('.hulkapps_option_value').find('.tb_property_val').val(res);$(this).addClass('textbox_selected');} else {telInput.addClass('error');$('.phone_number"+option_id+"').parents('.hulkapps_option_value').find('#error-msg').css('cssText', 'display: block !important');$(this).parents('.hulkapps_option_value').find('.tb_property_val').val(res);$(this).removeClass('textbox_selected');}}else{$('.phone_number').parents('.hulkapps_option_value').find('#error-msg').css('cssText', 'display: none !important');$(this).parents('.hulkapps_option_value').find('.tb_property_val').val(res);$(this).removeClass('textbox_selected');}conditional_rules("+data['pid']+");if($('#hulk_amount_dis').val() == '1'){calc_options_total("+data['pid']+");}validate_single_option('option_type_id_"+option_id+"', 'pn_render');});});</script>"
                            });
                            html = html + cc + "</div></div>"
                            all_html = all_html + html
                          }                   
                        }
                      });
                      var currency_hidden_field = "<input type='hidden' name='currency_symbol' value='"+data['currency_symbol']+"'>"
                      if(all_html !== ''){
                        addtocart_html = addtocart_html + all_html + currency_hidden_field  
                      }
                      addtocart_html += "</div>"
                      if( parseInt(amount_note_display) == 1 || amount_note_display == ''){
                        addtocart_html += "<div id='option_total' style='display: none;'><input type='hidden' id='raw_option_total' value='0'><div id='option_display_total_format'>" +update_total_text+ "<span id='formatted_option_total'>" +data['currency_symbol'] +"<span id='calculated_option_total'>0.00</span></span>" +post_total_text+ "</div></div>"
                      }
                      
                      addtocart_html += "<div id='error_text'></div><script>$('#hulkapps_options_"+data['pid']+"').closest('form').unbind();</script>"
                      addtocart_html += "</div></div>"
                    }
                    $("#hulkapps_custom_options_"+window.hulkapps.product_id).html(addtocart_html);
                    conditional_rules(window.hulkapps.product_id);
                    $('#hulkapps_options_' + window.hulkapps.product_id).closest("form").find(':submit').addClass('hulkapps_submit_cart');
                  }, 500);
                }
              }
            });
          }
        }
        $("body").on("change", 'input[name="updates[]"]', function(ev) {
          $('[name="update"]').click();
        });
      }, 1);

      if (window.hulkapps.page_type == "cart" && window.hulkapps.cart.item_count == 0){
        localStorage.removeItem('discount_code');     
      }
      
      if(window.hulkapps.page_type == "cart" && window.hulkapps.cart.items.length > 0){
        var pv_cart_url = '';
        if(window.hulkapps.is_volume_discount){
          pv_cart_url = window.hulkapps.vd_url+"/shop/get_cart_details";
        }else if(window.hulkapps.is_product_option){
          pv_cart_url = window.hulkapps.po_url+"/store/get_cart_details";
        }
        if(pv_cart_url != ''){
          var storage_code = localStorage.getItem('discount_code');
          // var cust_id = window.hulkapps.customer ? window.hulkapps.customer.id : '' 
          var ctags = window.hulkapps.customer ? window.hulkapps.customer.tags : '' 
          if (storage_code != ''){
            $('.hulkapps_discount_code').val(storage_code);
            // var get_cart_data = {cart_data: window.hulkapps,store_id: window.hulkapps.store_id, discount_code: storage_code, cart_collections: JSON.stringify(window.hulkapps.cart_collections),cid: cust_id}
            var get_cart_data = {cart_data: window.hulkapps,store_id: window.hulkapps.store_id, discount_code: storage_code, cart_collections: JSON.stringify(window.hulkapps.cart_collections), ctags: ctags}
          }else{
            var get_cart_data = {cart_data: window.hulkapps,store_id: window.hulkapps.store_id,cid: cust_id}
          }
          $(checkout_selectors).attr('disabled', true);
          $.ajax({
            type: "POST",
            url: pv_cart_url,
            data: get_cart_data,
            crossDomain: true,
            success: function(data){
              $(checkout_selectors).attr('disabled', false);
              hulkappsDoActions(data)
            },
            error: function (request, error) {
              $(checkout_selectors).attr('disabled', false);
            }
          });
        }
        $('body').on('click', '.edit_cart_option', function(e) {
          $('body').addClass('body_fixed');
          e.preventDefault();
          var key = $(this).data("key");
          var cart = window.hulkapps.cart;
          var store_id = window.hulkapps.store_id;
          var pid = $(this).data("product_id");
          var variant_id = $(this).data("variant_id");
          $("[name^='properties']").each(function(){
            if($(this).val() == ''){
              $(this).attr('disabled',true);
            }
          });
          $.ajax({
            type: 'POST',
            url: window.hulkapps.po_url+'/api/v2/store/edit_cart',
            data: { cart_data: cart ,item_key: key, store_id: store_id, variant_id: variant_id },
            cache: false,
            crossDomain: true,
            success: function(data){
              if (data == 'ok'){
                location.reload();
              }else{
                $('#edit_cart_popup').html(data);
                $('.edit_popup').show();
                calc_options_total(pid);
                conditional_rules(pid);             
              }
            }
          });
        });
      }
    }
    if(window.hulkapps.is_product_option || window.hulkapps.is_volume_discount){
      hulkappsStart($);
    }
  }

  window.cartPageJS = function($){
     

    // When user enter the phone_number.
    $('body').on('keypress', '.hulkapps_discount_code', function(e){
      if(e.which == 13){
        $(".hulkapps_discount_button").click();
      }
      if(e.which === 32){
        return false;
      }
    });

    // Button click for Apply Discount.  
    $('body').on('click', '.hulkapps_discount_button', function(e){
      e.preventDefault();
      var code = $('.hulkapps_discount_code').val();
      if(code == ''){
        $('.hulkapps_discount_code').addClass('discount_error');
      }else{
        localStorage.setItem('discount_code', code);
        $('.hulkapps_discount_code').removeClass('discount_error');
        location.reload();
      }
    });

    $('body').on('click', '.close-tag', function(e){
      localStorage.removeItem('discount_code');
      location.reload();
    });

    // When user click on edit_cart save popup.
     $('body').on('click', '.hulkapp_save',function(e){
      e.preventDefault();
      if (validate_options($(this).data('product_id'))) {
        $(checkout_selectors).attr('disabled',true);
        var line = parseInt($(this).parents('.hulkapp_popupBox').find('.hulkapp_mainContent').find('.h_index').val())+1;
        var qty = $(this).attr('data-quantity');
        var line_variant_id = $(this).parents('.hulkapp_popupBox').find('.hulkapp_mainContent').find('.h_variant_id').val();
        let properties = {};
        
        $("#edit_cart_popup [name^='properties']").each(function (index, el) {
          if ($(this).val() == '') {
            $(this).remove();
          }
          let name;
          if (this.type == "radio") {
            if (this.checked) {
              name = this.name.replace('properties[', '').replace(']', '');
              if ($.trim(this.value).length > 0) {
                properties[name] = this.value;
              }
            }
          }else if(this.type == "file"){
            name = this.name.replace('properties[', '').replace(']', '');
            if ($.trim(this.value).length > 0) {
              properties[name] = this.value;
            }
            
          }else {
            name = this.name.replace('properties[', '').replace(']', '');
            if ($.trim(this.value).length > 0) {
              properties[name] = this.value;
            }
          }
          
        });
        
        if ($.isEmptyObject(properties)) {
          $.ajax({
            type: 'POST',
            url: '/cart/change.js',
            data: {
              quantity: 0,
              line: line
            },
            dataType: 'json',
            success: function(cart) {
              
              if($('.upload_cls').val() != ''){
                $('.upload_h_cls').remove();
              }else{
                $('.upload_cls').remove();
              }
              $('#edit_cart_popup .conditional').each(function(index,element){
                $(this).find('.hulkapps_option_value input[type="hidden"]').val('');
              });
              $("[name^='properties']").each(function(index, el) {
                if($(this).val() == ''){
                  $(this).remove();
                }
              });
              $.ajax({
                type: 'POST',
                url: '/cart/add.js',
                data: {
                  quantity: qty,
                  id: line_variant_id
                },
                dataType: 'json',
                success: function (cart_item) {
                  location.reload();                  
                }
              });
            }
          });
        } else { 
          var formData = new FormData($('#edit_cart_popup')[0]);
          formData.append('quantity', qty);
          formData.append('line', line);
          $.ajax({
            type: 'POST',
            url: '/cart/change.js',
            data: {
              quantity: 0,
              line: line
            },
            dataType: 'json',
            success: function(cart) {
              if($('.upload_cls').val() != ''){
                $('.upload_h_cls').remove();
              }else{
                $('.upload_cls').remove();
              }
              $('#edit_cart_popup .conditional').each(function(index,element){
                $(this).find('.hulkapps_option_value input[type="hidden"]').val('');
              });
              $("[name^='properties']").each(function(index, el) {
                if($(this).val() == ''){
                  $(this).remove();
                }
              });
              
              $.ajax({
                type: 'POST',
                url: '/cart/add.js',
                data: formData,
                dataType: 'json',
                contentType: false,
                processData: false,
                success: function (cart_item) {
                  location.reload();                  
                }
              });
            }
          });
        }
      };
    });

    // When edit_cart popup is close.
    $('body').on('click touchstart', '.hulkapp_close', function(e) {
      $('.edit_popup').hide();
      $('body').removeClass('body_fixed');
    });
  }

  window.productPageJS = function($){
    window.conditional_rules = function(prod_id) {
      pass=false;
      verify_all = Array();
      verify_any = Array();
      verified_condition = Array();
      pass_array = Array();
      $("#hulkapps_option_list_" + prod_id + " .condition_hide").removeClass("conditional");
      $("#hulkapps_option_list_" + prod_id + " .condition_show").addClass("conditional");
      $("#hulkapps_custom_options_" + prod_id + " #conditional_rules").children().each(function() {
        pass_array = Array();
        pass=false;
        $(this).children().each(function() {
          pass=false;
          var condition_rule = $(this).text();
          var field_value;
          if ($("#hulkapps_option_list_" + prod_id + " .option_type_id_" + $(this).attr("data-field-num")).hasClass("dd_multi_render") == true) {
            var aa = condition_rule; 
            if (aa.indexOf("!=") >= 0){pass=true;}
            var count = $("#hulkapps_option_list_" + prod_id + " .hulkapps_option_" + $(this).attr("data-field-num") + "_visible:visible :selected").length;
            var ct=1;
            var selected_array = Array();
            if($("#hulkapps_option_list_" + prod_id + " .hulkapps_option_" + $(this).attr("data-field-num") + "_visible:visible :selected").length > 0){
              $("#hulkapps_option_list_" + prod_id + " .hulkapps_option_" + $(this).attr("data-field-num") + "_visible:visible :selected").each(function(){
                var condition_rule=aa;  
                field_value = $(this).data("conditional-value");
                condition_rule = condition_rule.replace("**value11**", field_value);
                if (condition_rule.indexOf("==") >= 0){
                  var condition_rule = condition_rule.split("==");
                  if (condition_rule[0] == condition_rule[1]) {
                    pass = true;
                  } else {
                    pass = false;
                  }
                }
                else{
                  var condition_rule = condition_rule.split("!=");
                  if (condition_rule[0] != condition_rule[1]) {
                    pass = true;
                  } else {
                    pass = false;
                  }
                }
                selected_array.push(pass);
                if(ct==count && count>1){
                  var result = selected_array.join(' || ');
                  result = eval(result);
                  pass_array.push(result);
                }
                else if(count==1){
                  pass_array.push(pass);
                }
                ct=ct+1;
              });
            }else{
              pass_array.push(false);
            }
          }
          else if ($("#hulkapps_option_list_" + prod_id + " .option_type_id_" + $(this).attr("data-field-num")).hasClass("cb_render") == true) {
            var aa = condition_rule;
            if (aa.indexOf("!=") >= 0){pass=true;}
            var ctt=1;
            var checked_array = Array();
            var countt = $("#hulkapps_option_list_" + prod_id + " .hulkapps_option_" + $(this).attr("data-field-num") + "_visible:visible:checked").length;
            $("#hulkapps_option_list_" + prod_id + " .hulkapps_option_" + $(this).attr("data-field-num") + "_visible:visible:checked").each(function() {
              var condition_rule = aa;
              field_value = $(this).data("conditional-value");
              condition_rule = condition_rule.replace("**value11**", field_value);
              if (condition_rule.indexOf("==") >= 0){
                var condition_rule = condition_rule.split("==");
                if (condition_rule[0] == condition_rule[1]) {
                  pass = true;
                }else{
                  pass = false;
                }
              }
              else{
                var condition_rule = condition_rule.split("!=");
                if (condition_rule[0] != condition_rule[1]) {
                  pass = true;
                }else{
                  pass = false;
                }
              } 
              checked_array.push(pass);
              if(ctt==countt && countt>1){
                var result = checked_array.join(' || ');
                result = eval(result);
                pass_array.push(result);
              }
              else if(countt==1){
                pass_array.push(pass);
              }
              ctt=ctt+1;
            });
          } 
          else if ($("#hulkapps_option_list_" + prod_id + " .option_type_id_" + $(this).attr("data-field-num")).hasClass("multiswatch_render") == true) {
            var aa = condition_rule;
            if (aa.indexOf("!=") >= 0){pass=true;}
            var ctt=1;
            var checked_array = Array();
            var countt = $("#hulkapps_option_list_" + prod_id + " .hulkapps_option_" + $(this).attr("data-field-num") + "_visible:checked").length;
            $("#hulkapps_option_list_" + prod_id + " .hulkapps_option_" + $(this).attr("data-field-num") + "_visible:checked").each(function() {
              var condition_rule = aa;
              field_value = $(this).data("conditional-value");
              condition_rule = condition_rule.replace("**value11**", field_value);
              if (condition_rule.indexOf("==") >= 0){
                var condition_rule = condition_rule.split("==");
                if (condition_rule[0] == condition_rule[1]) {
                  pass = true;
                }else{
                  pass = false;
                }
              }
              else{
                var condition_rule = condition_rule.split("!=");
                if (condition_rule[0] != condition_rule[1]) {
                  pass = true;
                }else{
                  pass = false;
                }
              } 
              checked_array.push(pass);
              if(ctt==countt && countt>1){
                var result = checked_array.join(' || ');
                result = eval(result);
                pass_array.push(result);
              }
              else if(countt==1){
                pass_array.push(pass);
              }
              ctt=ctt+1;
            });
          } 
          else { 
            pass=false;
            if ($("#hulkapps_option_list_" + prod_id + " .option_type_id_" + $(this).attr("data-field-num")).hasClass("rb_render") == true) {
              field_value = $("#hulkapps_option_list_" + prod_id + " .hulkapps_option_" + $(this).attr("data-field-num") + ":checked").data("conditional-value");
            }
            else if ($("#hulkapps_option_list_" + prod_id + " .option_type_id_" + $(this).attr("data-field-num")).hasClass("dd_render") == true) {
              field_value = $("#hulkapps_option_list_" + prod_id + " #" + $(this).attr("data-field-num") + " option:selected").data("conditional-value");
            } 
            else if ($("#hulkapps_option_list_" + prod_id + " .option_type_id_" + $(this).attr("data-field-num")).hasClass("swatch_render") == true) {
              field_value = $("#hulkapps_option_list_" + prod_id + " .hulkapps_option_" + $(this).attr("data-field-num")+ ".swatch_selected").data("conditional-value");
            }else{
              field_value = $("#hulkapps_option_list_" + prod_id + " #" + $(this).attr("data-field-num") + "").val();
            }
            condition_rule = condition_rule.replace("**value11**", field_value);
            if (condition_rule.indexOf("==") >= 0){
              var condition_rule = condition_rule.split("==");
              if (condition_rule[0] == condition_rule[1]) {
                pass = true;
              }else{
                pass = false;
              }
            }else{
              var condition_rule = condition_rule.split("!=");
              if (condition_rule[0] != condition_rule[1]) {
                pass = true;
              }else{
                pass = false;
              }
            }
            pass_array.push(pass);
          }
        });

        var type_rule = $(this).attr("data-verify-all");
        var condition_id = $(this).attr("name");
        if(type_rule=="0"){
          var res = pass_array.join(' || ');
        }
        else{
          var res = pass_array.join(' && ');
        }
        res = eval(res);
        if(res){
          $("#hulkapps_option_list_" + prod_id + " ." + condition_id + "_show").removeClass("conditional");
          $("#hulkapps_option_list_" + prod_id + " ." + condition_id + "_hide").addClass("conditional");
          $("#hulkapps_option_list_" + prod_id + " ." + condition_id + "_hide.conditional").find('.hulkapps_option_child').each(function() {
            conditional_change($(this));
          });
        }
        else{
          $("#hulkapps_option_list_" + prod_id + " ." + condition_id + "_show.conditional").find('.hulkapps_option_child').each(function() {
            conditional_change($(this));
          });
        }
        });
        calc_options_total(prod_id);
      // border_bottom = $(".hulkapps_option:visible").css("border-bottom");
      // $(".hulkapps_option:visible").css("border-bottom",border_bottom);
      // $(".hulkapps_option:visible:last").css("border-bottom","none");
    }
    window.conditional_change = function(obj){
      if (obj.prop("type") == "select-one" || obj.prop("type") == "select-multiple") {
        if (obj.val()){
          obj.val('').change();
        }
      }
      else if (obj.prop("type") == "radio") {
        if (obj.prop("checked")){
          obj.prop("checked", false);
          obj.val('');
          obj.parent().find('.radio_selected').removeClass("radio_selected");
        }
      }
      else if (obj.prop("type") == "textarea" || obj.prop("type") == "text" || obj.prop("type") == "hidden" || obj.prop("type") == "file" || obj.prop("type") == "email" || obj.prop("type") == "date_picker"){
        if (obj.val()){
          obj.val('').change();
          obj.parents('.hulkapps_option_value').find('.tb_property_val').val('');
          obj.parents('.hulkapps_option_value').find('#valid-msg').remove();
        }
      }
      else if (obj.prop("type") == "checkbox") {
        if (obj.prop("checked")){
          obj.prop("checked", false);
          obj.parent().removeClass("swatch_selected");
        }
      }
      else if (obj.prop("tagName") == "DIV") {
        if (obj.find('.swatch_radio').prop("checked")){
          obj.find('.swatch_radio').prop("checked", false);
          obj.removeClass("swatch_selected");
        }
      }
    }
    window.calc_options_total = function(product_id) {
      var i;
      var total = 0;
      var format = window.hulkapps.money_format;

      checked_variant = $("#hulkapps_option_list_" + product_id + ":visible .price-change:checked, #hulkapps_option_list_" + product_id + ":visible .price-change:selected, .hulkapps_swatch_option .swatch_selected,.textarea_selected,.textbox_selected,.emailbox_selected,.datepicker_selected,.numberfield_selected");
      for (i = 0; i < checked_variant.length; i++) {
        if(!$(checked_variant[i]).parents(".hulkapps_option").hasClass('conditional')){
          total = Number($(checked_variant[i]).attr("data-price")) + Number(total);
        }
      }
      $("#hulkapps_options_" + product_id + " #raw_option_total").val(total);
      $("#hulkapps_options_" + product_id + " #calculated_option_total").html(total.toFixed(2));
      if (total > 0 && 1) {
        $('#hulkapps_options_' + product_id + ' #option_total').slideDown();
      }else{
        $('#hulkapps_options_' + product_id + ' #option_total').slideUp();
      }
    } 

    window.check_character_limit = function(chartotal,product_id,remain_char_msg) {
      var text_length = $('.hulkapps_option_value .hulkapps_option_'+product_id+'').val().length;
      var text_remaining = chartotal - text_length;
      $('#char_count_'+product_id+'').html(text_remaining + ' ' + remain_char_msg);
    }          
    window.validate_options = function(product_id) {
      var good = true;
      $(".hulkapps_option:visible").each(function() {
        if ($(this).hasClass("validation_error")) {
          good=false;
        }
      });
      $('#hulkapps_options_' + product_id + ' #error_text').html('');
      var hulkapps_req = $("#hulkapps_option_list_" + product_id + ":visible .required:visible");
      var i;
      for (i = 0; i < hulkapps_req.length; i++) {
        if ($(hulkapps_req[i]).find("select[name^='properties']").length == 1 && !$(hulkapps_req[i]).find("select[name^='properties']").val()) {
          $(hulkapps_req[i]).addClass("validation_error");
          good = false;
        } else if ($(hulkapps_req[i]).find(".hulkapps_radio_option").length && !$(hulkapps_req[i]).find("input[name^='properties']:checked").length) {
          $(hulkapps_req[i]).addClass("validation_error");
          good = false;
        }
        else if ($(hulkapps_req[i]).find(".hulkapps_swatch_option").length && !$(hulkapps_req[i]).find("input[name^='properties']:checked").length) {
          $(hulkapps_req[i]).addClass("validation_error");
          good = false;
        } else if ($(hulkapps_req[i]).find("input[type='text']").length > 1) {
          $(hulkapps_req[i]).find("input[type='text']").each(function(){
            if($(this).val() == ''){
              $(hulkapps_req[i]).addClass("validation_error");  
              good = false;
            }
          });
        } else if ($(hulkapps_req[i]).find("input[type='text']").length && !$(hulkapps_req[i]).find("input[name^='properties']").val()) {
          $(hulkapps_req[i]).addClass("validation_error");
          good = false;
        }
        else if ($(hulkapps_req[i]).find("input[type='email']").length && !$(hulkapps_req[i]).find("input[name^='properties']").val()){
          $(hulkapps_req[i]).addClass("validation_error");
          good = false;
        } else if ($(hulkapps_req[i]).find(".hulkapps_check_option").length && !$(hulkapps_req[i]).find("input[name^='properties']").val()) {
          $(hulkapps_req[i]).addClass("validation_error");
          good = false;
        } else if ($(hulkapps_req[i]).find("input[type='file']").length && !$(hulkapps_req[i]).find("input[name^='properties']").val()) {
          $(hulkapps_req[i]).addClass("validation_error");
          good = false;
        } else if ($(hulkapps_req[i]).hasClass("cb_render") && $(hulkapps_req[i]).find("input[type='checkbox']:checked").length && !$(hulkapps_req[i]).find("input[name^='properties']").length) {
          $(hulkapps_req[i]).addClass("validation_error");
          good = false;
        } else if ($(hulkapps_req[i]).hasClass("multiswatch_render") && $(hulkapps_req[i]).find("input[type='checkbox']:checked").length && !$(hulkapps_req[i]).find("input[name^='properties']").length) {
          $(hulkapps_req[i]).addClass("validation_error");
          good = false;
        } else if ($(hulkapps_req[i]).find("textarea").length && !$(hulkapps_req[i]).find("input[name^='properties']").val()) {
          $(hulkapps_req[i]).addClass("validation_error");
          good = false;
        } else if ($(hulkapps_req[i]).find("input[type='number']").length && !$(hulkapps_req[i]).find("input[name^='properties']").val()) {
          $(hulkapps_req[i]).addClass("validation_error");
          good = false;

        } else if ($(hulkapps_req[i]).hasClass("dp_render") && $(hulkapps_req[i]).find("input[type='text']").length && !$(hulkapps_req[i]).find("input[name^='properties']").val()) {
          $(hulkapps_req[i]).addClass("validation_error");
          good = false;  
        } else if ($(hulkapps_req[i]).find("select[multiple]").length && !$(hulkapps_req[i]).find("input[name^='properties']").val()) {
          $(hulkapps_req[i]).addClass("validation_error");
          good = false;
        } else {
          $(hulkapps_req[i]).removeClass("validation_error");
        }
      }

      $("#hulkapps_option_list_" + product_id + " .cb_render:visible").each(function(){
        if($(this).hasClass('required')){
          if ($(this).find("input[type='checkbox']").length){
            if ($(this).find("input[name^='properties']").val()){
              if ($(this).find('.error_span').length > 0){
                $(this).addClass("validation_error");
                good=false;
              }else{
                $(this).removeClass("validation_error");
              }
            }else{
              $(this).addClass("validation_error");
              good=false;
            }
          }else{
            if ($(this).find('.error_span').length > 0){
              $(this).addClass("validation_error");
              good=false;
            }else{
              $(this).removeClass("validation_error");
            }
          }
        }else{
          if ($(this).find('.error_span').length > 0){
            $(this).addClass("validation_error");
            good=false;
          }else{
            $(this).removeClass("validation_error");
          }
        }
      });
      $("#hulkapps_option_list_" + product_id + " .multiswatch_render:visible").each(function(){
        if($(this).hasClass('required')){
          if ($(this).find("input[type='checkbox']").length){
            if ($(this).find("input[name^='properties']").val()){
              if ($(this).find('.error_span').length > 0){
                $(this).addClass("validation_error");
                good=false;
              }else{
                $(this).removeClass("validation_error");
              }
            }else{
              $(this).addClass("validation_error");
              good=false;
            }
          }else{
            if ($(this).find('.error_span').length > 0){
              $(this).addClass("validation_error");
              good=false;
            }else{
              $(this).removeClass("validation_error");
            }
          }
        }else{
          if ($(this).find('.error_span').length > 0){
            $(this).addClass("validation_error");
            good=false;
          }else{
            $(this).removeClass("validation_error");
          }
        }
      });

      $("#hulkapps_option_list_" + product_id+ " .dd_multi_render:visible").each(function(){
        if($(this).hasClass('required')){
          if ($(this).find("select[multiple]").length){
            if ($(this).find("input[name^='properties']").val()){
              if ($(this).find('.error_span').length > 0){
                $(this).addClass("validation_error");
                good=false;
              }else{
                $(this).removeClass("validation_error");
              }
            }else{
              $(this).addClass("validation_error");
              good=false;
            }
          }else{
            if ($(this).find('.error_span').length > 0){
              $(this).addClass("validation_error");
              good=false;
            }else{
              $(this).removeClass("validation_error");
            }
          }
        }else{
          if ($(this).find('.error_span').length > 0){
            $(this).addClass("validation_error");
            good=false;
          }else{
            $(this).removeClass("validation_error");
          }
        }
      });
      $("#hulkapps_option_list_" + product_id + " .et_render.required:visible").each(function(){
        if ($(this).find("input[type='email']").length && ((!$(this).find("input[name^='properties']").val() && $(this).hasClass('required')) || (($(this).find("input[type='email']").val()) != ''))){
          var userEmail = $(this).find("input[type='email']").val();
          var filter = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
          if (!filter.test(userEmail)) {
            $(this).addClass("validation_error");
            good=false;
          }
          else {
            $(this).removeClass("validation_error");
          }
        }
      });
      $("#hulkapps_option_list_" + product_id + " .pn_render.required:visible").each(function(){
        if($(this).find("input[type='textbox']").length && ((!$(this).find("input[name^='properties']").val() && $(this).hasClass('required')))){
          $(this).addClass("validation_error");
          good=false;
        }else{
          if($(this).find(".phone_number").hasClass('error')){
            $(this).addClass("validation_error");
            good=false;
          }else{
            $(this).removeClass("validation_error");
          }
        }
      });
      $("#hulkapps_option_list_" + product_id + " .dp_render:visible").each(function(){
        if ($(this).find('.error_span').length > 0){
            $(this).addClass("validation_error");
            good=false;
        }else{
            $(this).removeClass("validation_error");
        }
      });
      $("#hulkapps_option_list_" + product_id + " .dp_render.required:visible").each(function(){
        if($(this).find("input[type='text']").length && ((!$(this).find("input[name^='properties']").val() && $(this).hasClass('required')))){
          $(this).addClass("validation_error");
          good=false;
        }else{
          if($(this).find('.error_span').length > 0){
            $(this).addClass("validation_error");
            good=false;
          }else{
            $(this).removeClass("validation_error");
          }
        }
      });
      
      return good;
    }
    window.validate_single_option = function(option_type_id,option_type) {
      if(option_type == 'dd_render'){
        if ($('.'+option_type_id).find("select[name^='properties']").length == 1 && !$('.'+option_type_id).find("select[name^='properties']").val() && $('.'+option_type_id).hasClass('required')) {
          $('.'+option_type_id).addClass("validation_error");
        }else{
          $('.'+option_type_id).removeClass("validation_error");
        }
      }

      else if(option_type == 'dd_multi_render'){
        if ($('.'+option_type_id).find("select[multiple]").length && !$('.'+option_type_id).find("input[name^='properties']").val() && $('.'+option_type_id).hasClass('required')) {
          $('.'+option_type_id).addClass("validation_error");
        }else{
          $('.'+option_type_id).removeClass("validation_error");
        }
      }

      else if(option_type == 'swatch_render'){
        // if ($('.'+option_type_id).find(".hulkapps_swatch_option").length && !$('.'+option_type_id).find("input[name^='properties']:checked").length && $('.'+option_type_id).hasClass('required')) {
        //   $('.'+option_type_id).addClass("validation_error");
        // }else {
          $('.'+option_type_id).removeClass("validation_error");
        // }
      }
      else if(option_type == 'multiswatch_render'){
        if ($('.'+option_type_id).find(".hulkapps_swatch_option").length && !$('.'+option_type_id).find("input[name^='properties']").val() && $('.'+option_type_id).hasClass('required')) {
          $('.'+option_type_id).addClass("validation_error");
        }else {
          $('.'+option_type_id).removeClass("validation_error");
        }
      }  
      else if(option_type == 'cb_render'){
        if ($('.'+option_type_id).find(".hulkapps_check_option").length && !$('.'+option_type_id).find("input[name^='properties']").val() && $('.'+option_type_id).hasClass('required')) {
          $('.'+option_type_id).addClass("validation_error");
        }else {
          $('.'+option_type_id).removeClass("validation_error");
        }
      }

      else if(option_type == 'tb_render'){
        if ($('.'+option_type_id).find("input[type='text']").length && !$('.'+option_type_id).find("input[name^='properties']").val() && $('.'+option_type_id).hasClass('required')) {
          $('.'+option_type_id).addClass("validation_error");
        }else {
          $('.'+option_type_id).removeClass("validation_error");
        }
      }
      else if(option_type == 'nf_render'){
        if ($('.'+option_type_id).find("input[type='number']").length && !$('.'+option_type_id).find("input[name^='properties']").val() && $('.'+option_type_id).hasClass('required')) {
          $('.'+option_type_id).addClass("validation_error");
        }else {
          $('.'+option_type_id).removeClass("validation_error");
        }
      }
      else if(option_type == 'dp_render'){
        if ($('.'+option_type_id).find("input[type='text']").length && $('.'+option_type_id).find("input[name^='properties']").val()){
          var rxDatePattern = /^(\d{1,2})(\/|-)(\d{1,2})(\/|-)(\d{4})$/; //Declare Regex
          var dtArray = $('.'+option_type_id).find("input[type='text']").val().match(rxDatePattern);    // is format OK?
          if (dtArray == null){
            $('.'+option_type_id).addClass("validation_error");
            $('.'+option_type_id).find('.validation_error').remove();
            $('.'+option_type_id).find("input[type='text']").after('<span class="validation_error error_span">Enter valid date format mm/dd/yyyy</span>');
          }else{ 
            //Checks for mm/dd/yyyy format.
            dtMonth = dtArray[1];
            dtDay= dtArray[3];
            dtYear = dtArray[5]; 
            if (dtMonth < 1 || dtMonth > 12){
              $('.'+option_type_id).addClass("validation_error");
              $('.'+option_type_id).find('.validation_error').remove();
              $('.'+option_type_id).find("input[type='text']").after('<span class="validation_error error_span">Enter valid date format mm/dd/yyyy</span>')
            }else if (dtDay < 1 || dtDay> 31){ 
              $('.'+option_type_id).addClass("validation_error");
              $('.'+option_type_id).find('.validation_error').remove();
              $('.'+option_type_id).find("input[type='text']").after('<span class="validation_error error_span">Enter valid date format mm/dd/yyyy</span>')
            }else if ((dtMonth==4 || dtMonth==6 || dtMonth==9 || dtMonth==11) && dtDay ==31){
              $('.'+option_type_id).addClass("validation_error");
              $('.'+option_type_id).find('.validation_error').remove();
              $('.'+option_type_id).find("input[type='text']").after('<span class="validation_error error_span">Enter valid date format mm/dd/yyyy</span>')
            }else if (dtMonth == 2){
              var isleap = (dtYear % 4 == 0 && (dtYear % 100 != 0 || dtYear % 400 == 0));
              if (dtDay> 29 || (dtDay ==29 && !isleap)){
                $('.'+option_type_id).addClass("validation_error");
                $('.'+option_type_id).find('.validation_error').remove();
                $('.'+option_type_id).find("input[type='text']").after('<span class="validation_error error_span">Enter valid date format mm/dd/yyyy</span>')
              }else{
                $('.'+option_type_id).removeClass("validation_error");
                $('.'+option_type_id).find('.validation_error').remove();
              }
            }else if (dtArray[2] !== "/" || dtArray[4] !== "/"){
                $('.'+option_type_id).addClass("validation_error");
                $('.'+option_type_id).find('.validation_error').remove();
                $('.'+option_type_id).find("input[type='text']").after('<span class="validation_error error_span">Enter valid date format mm/dd/yyyy</span>')
            }else{
              $('.'+option_type_id).removeClass("validation_error");
              $('.'+option_type_id).find('.validation_error').remove();
            }
          }
        }else{
          if ($('.'+option_type_id).find("input[type='text']").length && !$('.'+option_type_id).find("input[name^='properties']").val() && $('.'+option_type_id).hasClass('required')) {
            $('.'+option_type_id).addClass("validation_error");
            $('.'+option_type_id).find('.validation_error').remove();
          }
          else {
            $('.'+option_type_id).find('.validation_error').remove();
            $('.'+option_type_id).removeClass("validation_error");
          }
        }
      }

      else if(option_type == 'ta_render'){
        if ($('.'+option_type_id).find("textarea").length && !$('.'+option_type_id).find("input[name^='properties']").val() && $('.'+option_type_id).hasClass('required')) {
          $('.'+option_type_id).addClass("validation_error");
        }else {
          $('.'+option_type_id).removeClass("validation_error");
        }
      }

      else if(option_type == 'rb_render'){
        // if ($('.'+option_type_id).find(".hulkapps_radio_option").length && !$('.'+option_type_id).find("input[name^='properties']:checked").length && $('.'+option_type_id).hasClass('required')) {
        //   $('.'+option_type_id).addClass("validation_error");
        // }else {
          $('.'+option_type_id).removeClass("validation_error");
        // }
      }

      else if(option_type == 'fu_render'){
        if ($('.'+option_type_id).find("input[type='file']").length && !$('.'+option_type_id).find("input[name^='properties']").val() && $('.'+option_type_id).hasClass('required')) {
          $('.'+option_type_id).addClass("validation_error");
        }else {
          $('.'+option_type_id).removeClass("validation_error");
        }
      }

      else if(option_type == 'pn_render'){
        if($('.'+option_type_id).find("input[type='textbox']").length && ((!$('.'+option_type_id).find("input[name^='properties']").val() && $('.'+option_type_id).hasClass('required')))){
          $('.'+option_type_id).addClass("validation_error");
          good=false;
        }else{
          if($('.'+option_type_id).find(".phone_number").hasClass('error')){
            $('.'+option_type_id).addClass("validation_error");
            good=false;
          }else{
            $('.'+option_type_id).removeClass("validation_error");
          }
        }
      }

      else if(option_type == 'et_render'){
        if ($('.'+option_type_id).find("input[type='email']").length && ((!$('.'+option_type_id).find("input[name^='properties']").val() && $('.'+option_type_id).hasClass('required')) || (($('.'+option_type_id).find("input[type='email']").val().length) != ''))){
          var userEmail = $('.'+option_type_id).find("input[type='email']").val();
          var filter = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
          if (!filter.test(userEmail)) {
            $('.'+option_type_id).addClass("validation_error");
          }else{
            $('.'+option_type_id).removeClass("validation_error");
          }
        }else{
          $('.'+option_type_id).removeClass("validation_error");
        }
      }
    }
    var hulk_flag = 0;
    $("body").on('click', '.hulkapps_submit_cart', function(e) {  
      if(hulk_flag == 0){
        e.preventDefault();
        var res = true;
        if (validate_options(window.hulkapps.product_id)) {
          $("[name^='properties']").each(function(){
            if($(this).val() == ''){
              $(this).attr('disabled',true);
            }
          });
          hulk_flag = 1;
          $('.hulkapps_submit_cart').click();
        }
      };
    });
  }
  
  window.writeCookie = function(cName,cVal,cExpMin) {
    cExpMin = cExpMin || 0;
    newDate = new Date;
    deleteCookie(cName);
      var date = new Date();
      date.setTime(date.getTime()+(cExpMin*60*1000));
      var expires = "; expires="+date.toGMTString();
      document.cookie = cName+"="+encodeURIComponent(cVal)+";expires="+date.toGMTString()+";path=/; samesite=none; secure"
  }

  window.readCookie = function(cname){
    var name = cname + "=";
    var ca = decodeURI(document.cookie);
    // var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }
  
  window.deleteCookie = function(name){
    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; samesite=none; secure';
  }
}

start();
if (typeof window.hulkapps !== 'undefined'){
  if ((typeof(jQuery) == 'undefined') || (parseInt(jQuery.fn.jquery) == 3 && parseFloat(jQuery.fn.jquery.replace(/^1\./,"")) < 2.1)) {
    loadScript('//ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js', function() {
      jQuery321 = jQuery.noConflict(true);
      checkAppInstalled(jQuery321);
    });
  }else{ 
    checkAppInstalled(jQuery);
  }
}

function checkPlan(slug,type,current_plan_id,plans_features) {
  is_allowed = true
  if (slug && type && plans_features && current_plan_id){
    if (jQuery.type(plans_features) == "string") {
      plans_features = JSON.parse(plans_features)
    }
    if (plans_features[current_plan_id][slug] == false && type == "boolean") {
      is_allowed = false
    } 
  } else {
    is_allowed = false
  }
  return is_allowed
}     