const firebaseConfig = {
  apiKey: "AIzaSyCdejgGQJhy_Ua0Jg5_9cT4PDiuwyudGko",
  authDomain: "stressor-c957e.firebaseapp.com",
  databaseURL: "https://stressor-c957e-default-rtdb.firebaseio.com",
  projectId: "stressor-c957e",
  storageBucket: "stressor-c957e.appspot.com",
  messagingSenderId: "526202936399",
  appId: "1:526202936399:web:6ad5d3a91be81d50c05e3a"
};


class Stressor {

    async getAll() {
        const users = [];

        try {
            const snapshot = await db.collection("stressors").get()
            snapshot.forEach(doc => users.push({id: doc.id, ...doc.data()}))
        } catch (err) {
            console.error('Error Getting stressors: ', error);
        }

        return users;
    }

    async getCountMap() {
        let rawResults = await this.getAll();
        console.log(rawResults);
        let result = (rawResults.reduce((a,{name}) => {

          //console.log(a);
          //console.log(name);
          let key = name;
          a[key] = a[key] || 0;
          a[key]= a[key]+1;
          return a;
        }, {}));
        return result;
    }

}



function drawChart() {

  let s = new Stressor();
  s.getCountMap().then(v => {
      console.log(v)

      // Create the data table.
      var data = new google.visualization.DataTable();
      data.addColumn('string', 'Stressors');
      data.addColumn('number', 'count');

      data.addRows(Object.entries(v));

    // Set chart options
    var options = {'title':'Flavor breakdown',
    'width':800,
    'height':600};

    // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.PieChart(document.getElementById('chart_div'));
    chart.draw(data, options);
    
  });
}



// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();

db.collection("stressors")
    .onSnapshot((doc) => {
        if (document.getElementById('chart_div') ){
          drawChart()
        }
    });

Vue.use(VueFirestore);

app =new Vue({
  el: "#app",
  firestore() {
     return {
       stressors: firebase.firestore().collection("stressors"),
       orders: firebase.firestore().collection("orders"),

     }
  },
  data(){
    return {
      stressor: {
        name: ""
      },
      order: {
        name: "",
        flavor:"Pick a flavor!",
        color:"Pick a color!",
        comment:"",
        timestamp:""
      },
      showAddFlavor:false,
      stressorTypeCount: "",
      stressorCount:0
    }
  },
  methods: {
    place() {
      console.log("order: "+ this.order)
      this.order.timestamp = new Date();
      this.$firestore.orders.add(this.order)
      .then(()=>{
        console.log("order placed", this.order);
      })
    },
    showAdd(){
      this.showAddFlavor = true;
    },
    add() {
      console.log("stressor: "+ this.stressor.name)
      console.log(this.stressor.name);
      this.$firestore.stressors.add(this.stressor)
      .then(()=>{
        this.showAddFlavor = false;
        this.order.flavor = this.stressor.name;
        //this.stressor.name = ""
      })
    },
    remove(e) {
      this.$firestore.stressors.doc(e['.key']).delete()
    },
    removeOrder(o){
      this.$firestore.orders.doc(o['.key']).delete()
    }
  },
  mounted(){

  }
});


google.charts.load('current', {'packages':['corechart']});

// Set a callback to run when the Google Visualization API is loaded.
google.charts.setOnLoadCallback(drawChart);

