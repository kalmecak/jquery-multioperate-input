/*!
    Multioperator v0.0.1 - 2014-04-24
    jQuery plugin to make operations from-this-target input, from-this input or same input
    check ./index.html and readme.md files
    (c) 2014 Christian Rodriguez - http://www.rcchristiane.com.mx/
                                 - https://github.com/kalmecak/jquery-multioperate-input
    license: http://www.opensource.org/licenses/mit-license.php
    
    Depends jquery v1.10.1
*/

(function ( $ ) {

    $.fn.multioperator = function(options) {
        var settings = $.extend({
            trigger: 'keypress',
            keyPress: 13,
            isMoney: true,
            decimals: 2,
            comma: true,
            from: false,
            target: false
        }, options);

        settings.from = settings.from ? settings.from : $( this ).data( 'from' ) ? $( this ).data( 'from' ) : false;
        settings.target = settings.target ? settings.target : $( this ).data( 'target' ) ? $( this ).data( 'target' ) : false;  

        var sumRes = new RegExp(/\-|\+/);
        var percent = new RegExp(/\%/);
        var multDiv = new RegExp(/\/|\*|[x]/i);

        // add an white space
        $( this ).on('focusin', function() {
            var val = $( this ).val().trim();
            if(val != '' ){
                $( this ).val( val + ' ' );
            }
        });

        // delete the white spaces
        $( this ).on('focusout', function() {
            $( this ).val( $( this ).val().trim() );
        });

        function getPercent( out, strng ) {
            var val = parseFloat( strng );
            if( !val ) return 0;
            val = Math.abs( val );
            var per = out * ( val / 100 );
            val = /\-/.test( strng ) ? out - per : out + per;
            return val;
        }

        function getAmount( out, strng ) {
            var val = parseFloat( strng );
            if( !val ) return 0;
            return out + val;
        }

        function mutlDivOp( out, strng ) {
            var val = strng.replace( multDiv, '' );
            val = parseFloat( val );
            if( !val ) return;
            if( /\*|[x]/i.test( strng ) ) {

                return ( out * val );

            } else if(/\//.test( strng )) {
                return ( out / val );
            }
        }

        function parse( orgnl, strng, out ) {
            if( multDiv.test(strng) ) {

                return mutlDivOp( out, strng );

            }else if( percent.test( strng ) && sumRes.test( strng ) ) {

                return getPercent( out, strng );

            } else if( sumRes.test( strng ) && !percent.test( strng ) ) {

                return getAmount( out, strng );

            } else {

                return orgnl;
            }
        }

        // Add commas to integger side
        function parseCommas( val ) {
            val = val.split( '.' );
            val[0] = val[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return val.join( '.' );
        }

        // Check if trigger is on teclad actions
        var trigger = ( settings.trigger === 'keyup' || settings.trigger === 'keydown' || settings.trigger === 'keypress' );

        $( this ).on( settings.trigger, function( e ) {

            if( trigger && settings.keyPress && e.keyCode !== settings.keyPress ) return;

            var from = settings.from;
            var oText = from ? $( '#' + from ).val() : $(this).val();
            var noMoney = oText.replace( '$','' ).replace( ',','' ).trim();
            var arr = from ? ' ' + $( this ).val() : noMoney;
                arr = arr.split( ' ' );
            var orgnl = from ? noMoney : arr[0];
            orgnl = parseFloat( orgnl );
            if( !orgnl ) return;
            var out = parseFloat( orgnl );
            for( i in arr) {
                if( !from ) {
                    if( arr[i] != '' && i != 0 ) out = parse( orgnl, arr[i], out );
                } else {
                    if( arr[i] != '' ) out = parse( orgnl, arr[i], out );
                }
            }
            out = out.toFixed( settings.decimals );
            if( settings.comma ) out = parseCommas( out );
            if( settings.isMoney ) out = '$' + out;

            if( settings.target ) {
                $( '#' + settings.target ).val( out + ' ' );
            } else {
                $( this ).val( out + ' ' );
            }
        });

        return this;
    }
}( jQuery ));
