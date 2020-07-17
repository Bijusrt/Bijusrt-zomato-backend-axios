const express = require('express')

const app = express();

const morgan = require('morgan');

const axios = require('axios');

const cors = require('cors');

var CircularJSON = require('circular-json');



app.use(express.json());

app.use(morgan('dev'));

app.use(cors());


axios.interceptors.request.use(
    
    config=>{
    
        config.headers['user-key'] = '762744021bd493249b69c52107e96cf5';
    
        return config;
    
    }

)

app.get('/',(req,res)=>{

    res.status(200).json({

        "For Categories" : "/categories",

        "For Geocode" : "/geocode?lat=laitude&lon=longitude",

        "For City" : "/search/city?query=city_name"

    })
    
});

app.get('/categories',(req,res)=>{

    axios.get('https://developers.zomato.com/api/v2.1/categories').then(result=>{
        
        const result1 = JSON.parse(CircularJSON.stringify(result));
        
        res.send(result1['data']['categories']);

    });

});

app.get('/geocode',(req,res)=>{

    var url = 'https://developers.zomato.com/api/v2.1/geocode?lat=' + req.query.lat + '&lon=' + req.query.lon;

    axios.get(url).then(result=>{

        const result1 = JSON.parse(CircularJSON.stringify(result));

        res.send(result1['data']);

    })

});

app.get('/search/city',async (req,res)=>{

    var url = 'https://developers.zomato.com/api/v2.1/locations?query=' + req.query.query;

    await axios.get(url).then(async result=>{

        const result1 = JSON.parse(CircularJSON.stringify(result));

        const url2 = 'https://developers.zomato.com/api/v2.1/location_details?entity_type=' + result1.data.location_suggestions[0].entity_type + '&entity_id=' + result1.data.location_suggestions[0].entity_id; 

        await axios.get(url2).then(result=>{

            const result1 = JSON.parse(CircularJSON.stringify(result));

            restaurant = result1['data'].best_rated_restaurant;

        })

    })

    var restaurant_details = [];

    for (var i of restaurant){

        var individual_restaurant = {

            'Name' : i.restaurant.name,
            
            'Link' : i.restaurant.url,

            'Address' : i.restaurant.location.address,

            'Cuisines' : i.restaurant.cuisines.split(',').splice(3,i.restaurant.cuisines.split(',').length),

            'Timings' : i.restaurant.timings,

            'Average Cost' : i.restaurant.average_cost_for_two,

            'Rating' : i.restaurant.user_rating.aggregate_rating,

            'Image Url' : i.restaurant.featured_image,

            'Contact' : i.restaurant.phone_numbers

        };

        if(i.restaurant.has_online_delivery == 1){

            individual_restaurant['Online Delivery'] = 'Yes';

        }else{

            individual_restaurant['Online Delivery'] = 'No';

        }

        var highlight = [];

        for(var j=0;j<3;j++){

            highlight.push(i.restaurant.highlights[j]);

        }

        individual_restaurant['Highlights'] = highlight;

        restaurant_details.push(individual_restaurant);
        
    }
    
    res.send(restaurant_details);

});



const port = process.env.PORT || 8000;

app.listen(port, () => 
  
    console.log(` app listening on port : `,port)
    
);
