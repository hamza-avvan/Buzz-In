$(document).ready(function(){
    var seconds = new Date().getSeconds(),
        minutes = new Date().getMinutes(),
        hours = new Date().getHours(),
        sdegree = seconds * 6,
        mdegree = minutes * 6,
        hdegree = hours * 30;
        
    $('.watch--sec').css('transform', 'rotate(' + sdegree + 'deg)');
    $('.watch--min').css('transform', 'rotate(' + mdegree + 'deg)');
    $('.watch--hour').css('transform', 'rotate(' + hdegree + 'deg)');

    if(hours <= 20){
        $('.night').removeClass('active');
        $('.day').addClass('active');
    }else{
        $('.day').removeClass('active');
        $('.night').addClass('active');
    }


    setInterval(function(){
    var seconds = new Date().getSeconds(),
        minutes = new Date().getMinutes(),
        hours = new Date().getHours(),
        sdegree = seconds * 6,
        mdegree = minutes * 6,
        hdegree = hours * 30;
        $('.watch--sec').css('transform', 'rotate(' + sdegree + 'deg)');
        $('.watch--min').css('transform', 'rotate(' + mdegree + 'deg)');
        $('.watch--hour').css('transform', 'rotate(' + hdegree + 'deg)');
    }, 1000)

})