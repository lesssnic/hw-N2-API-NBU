

    
    const URL = 'https://bank.gov.ua/NBUStatService/v1/statdirectory/ovdp?json';

    const listRatesURL = 'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json';

    Vue.createApp({

        data(){
            return {
                debtCheck: [],
                check: false
            }
        },
        computed: {
            totalDebtChecked(){
                if(this.debtCheck.length > 0){
                    let sum = this.debtCheck.reduce((acc, item) => item.checked?(acc + item.attraction):acc , 0 )    
                return sum
                }
            },
            totalDebt(){
                if(this.debtCheck.length > 0){
                    let sum = this.debtCheck.reduce((acc, item) => acc + item.attraction , 0 )    
                return sum
                }
            }
            
        },
        methods: {
            chooseAll(){
                this.check = !this.check?true:false;
                this.debtCheck.map(item => item.checked = this.check);
            }
            
        },
        async mounted() {
            let obligation = await fetch(URL);
                obligation = await obligation.json();

            let rates = await fetch(listRatesURL);
                rates = await rates.json();

            let rateUSD = +rates.filter(item => item.cc == 'USD').map(item => item = item.rate).toString();
            let rateEUR = +rates.filter(item => item.cc == 'EUR').map(item => item = item.rate).toString();    

            obligation = obligation.filter(item => item.attraction != 0);

            obligation.map(item => {
                if (item.valcode == "USD"){
                    item.attraction = item.attraction * rateUSD;
                    item.valcode = "UAH";
                }
                if (item.valcode == "EUR"){
                    item.attraction = item.attraction * rateEUR;
                    item.valcode = "UAH";
                }

            });
            let debt = {};
            obligation.forEach(item => {
                let year = item.repaydate.split('.')[2];
                if(debt.hasOwnProperty(year)){

                    debt[year] += item.attraction;

                }else debt[year] = item.attraction;
            });

            for(item in debt){
                this.debtCheck.push({year: item,
                                     attraction: debt[item],
                                     checked: false})
            }
                    
        }
    }).mount('#app');
