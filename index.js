const { addArticle } = require("./addArticle");

if (process.argv[2]) {
    var URL = process.argv[2];
    addArticle(URL);
} else {
    console.error('Enter an URL');
    addArticle('https://index.hu/techtud/2019/12/20/tudomanyos_okosito_urkutatas_holdraszallas_klimavaltozas_mta_elkh_hiv_aids_rak_sma_sziami_ikrek/');
       
}

