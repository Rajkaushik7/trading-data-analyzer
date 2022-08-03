function countThursday(endDate, startDate){
    console.log('in')
    end = new Date(2020,1,21)
    start = new Date(2020,1,31)
    if(end <= start)return; //avoid infinite loop;
        for(var count = {sun:0, sat:0}; start < end; start.setDate(start.getDate() + 1)){
        if(start.getDay() == 0)count.sun++;
        else if(start.getDay() == 6)count.sat++;
    }
    console.log(count,'done');
}
console.log("ok")
countThursday()
var thursdays = 
$(function(){
    $("#add-strike").on('click', function(){
        addStrike();
    })

    $(document).on('click','.remove-strike', function(){
        $(this).closest('.strikes-container').remove();
    })
    var allowRequest = true;
    $('#my-form').on('submit', function(e){
        e.preventDefault();
        if(!allowRequest){
            return;
        }
        allowRequest = false;
        var data = $('form').serializeArray();
        let strikes = [];
        let idx = 0;
        $("#data-feed").empty();
        $("#data-heads").empty();
        for(let i=0; i < data.length; i++){
            if(data[i].name == 'option'){
                strikes[idx] = [];
                strikes[idx][0] = data[i].value;
            }
            if(data[i].name == 'strike') {
                strikes[idx][1] = data[i].value;
                idx++;
            }
        }
        data.push({
            name: "legs",
            value: strikes
        })
        $('.backdrop').addClass('d-all');
        $.post('/data_visualizer/fetch_data', data).then(function(response){
            let res = JSON.parse(response);
            if(res.hasOwnProperty('error')){
                alert(res.error);
                location.reload();
            }
            console.log(res, typeof(res),res.hasOwnProperty('error'))
            populate_data(res);
            populate_map_data(data, res);
            $('.backdrop').removeClass('d-all');
            allowRequest = true;
        });
    });

    $('.strike').on('change', function(){
        console.log($('.option'),$('.strike'))
    })

    $('#reset').on('click', function(){
        location.reload();
    })
})

function populate_data(data){
    let heads = data.columns
    $('#data-heads').append('<th>Date</th>')
    for(let i=0; i<heads.length; i++){
        $('#data-heads').append('<th>' + heads[i] + '</th>')
        console.log("ok");
    }
    for(let i=0; i<data.data.length; i++){
        $('#data-feed').append('<tr scope="row">');
        for(let j=0; j<data.data[i].length; j++){
            if(j == 0){
                $('#data-feed').append('<td>' + data.index[i] + '</td>');
            }
            $('#data-feed').append('<td>' + data.data[i][j] + '</td>');
        }
        $('#data-feed').append('</tr>');
    }
}

function addStrike(){
    strikeForm = '<div class="strikes-container"><label>Option</label><select class="option" required name="option"><option value="PE">PE</option><option selected value="CE">CE</option></select><label class="atm">ATM</label><input class="strike" required name="strike" type="number" />            <label>Lot</label><input value="1" class="strike" required name="lot" type="number" /><select class="action" name="action"><option value="buy">Buy</option><option value="spell">Sell</option></select><button type="button" class="remove-strike">X</button></div>'
    $('#strike-wrapper').append(strikeForm)
}

function calculate() {

}

function populate_map_data(formData, response) {
    var mapping = [];
    console.log(formData);
    itr = -1;
    for(let i=0; i < formData.length - 1;) {
        if(formData[i].name == "option"){
            itr++;
        }
        if(itr > -1) {
            mapping[itr] = {
                "option" : formData[i].value,
                "lot" : formData[i+2].value,
                "action": formData[i+3].value,
                "key" : "option" +  formData[i+1].value + formData[i].value
            }
            i += 4;
            continue;
        }
        i++;
    };

    var finalArray = [];
    columns = response.columns
    for(let i=0; i < mapping.length; i++){
        mapping[i].targetColumn = columns.indexOf(mapping[i].key + "(1)");
        finalArray[columns.indexOf(mapping[i].key + "(0)")] = mapping[i];
    }
    
    finalArray.forEach(function(ele, index){

        console.log(ele, index);
    })
    visualize_calculated_data(finalArray, response);
}

function visualize_calculated_data(data, response) {
    thursdays = 
    $('#calc-data-feed').empty();
    $('#calc-data-heads').empty();
    thead = $('#calc-data-heads');
    thead.append('<th>Date</th>');
    thead.append('<th>Time1</th>');
    thead.append('<th>Time2</th>');
    thead.append('<th>Spot(1)</th>');
    thead.append('<th>Spot(2)</th>');
    data.forEach(function(ele, index){
        thead.append('<th>' + ele.key + '</th>');
    })
    thead.append('<th>Total</th>');

    columnToShow = [];
    columnToShow.push(response.columns.indexOf('time1'))
    columnToShow.push(response.columns.indexOf('time2'))
    columnToShow.push(response.columns.indexOf('spot(1)'))
    columnToShow.push(response.columns.indexOf('spot(2)'))

    for(let i=0; i<response.data.length; i++){
        $('#calc-data-feed').append('<tr scope="row">');
        $('#calc-data-feed').append('<td>'+ response.index[i] + '</td>')
        let finalVal = 0;
        columnToShow.forEach(function(ele){
            $('#calc-data-feed').append('<td>' + response.data[i][ele] + '</td>')
        })
        data.forEach(function(ele, index){
            let c1 = response.data[i][index] * ele.lot;
            let c2 = response.data[i][ele.targetColumn] * ele.lot
            let val = 0;
            if(ele.action == "buy") {
                val = c1 - c2;
            }else{
                val = -c1 + c2
            }
            val = parseFloat(val.toFixed(2));
            if(val < 0)
                $('#calc-data-feed').append('<td class="red">' + val + '</td>');
            else    
                $('#calc-data-feed').append('<td>' + val + '</td>');
            finalVal += val;
        })

        finalVal =  parseFloat(finalVal.toFixed(2));
        if(finalVal < 0)
            $('#calc-data-feed').append('<td class="red">' + finalVal + '</td>');
        else
            $('#calc-data-feed').append('<td class="green">' + finalVal + '</td>');
        $('#data-feed').append('</tr>');
    }


}