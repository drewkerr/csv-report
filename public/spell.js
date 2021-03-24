function check(elements) {
  var text = ''
  $(elements).each(function() {
    text += $(this).text() + ' '
  })
  var url = 'https://service.afterthedeadline.com/checkDocument'
  return $.post(url, { data: text })
}

function mark(results) {
  var marked = []
  var types = {}
  $('.comment').each(function() {
    var com = $(this)
    var stu = com.first().parent().children().first().text()
    $('error', results).each(function(i) {
      if (marked.indexOf(i) !== -1) return
      var str = $('string', this).text()
      if (stu.indexOf(str) !== -1) return
      var pre = $('precontext', this).text()
      var rep = pre ? pre + ' ' + str : str
      var rem = com.contents().last()
      if (rem.text().indexOf(rep) == -1) return
      marked.push(i)
      var des = $('description', this).text()
      var sug = $('suggestions > option', this).first().text()
      var url = $('url', this).text()
      var tip = sug ? des + ", try '" + sug + "'" : des
      var typ = $('type', this).text()
      types[typ] = (types[typ]+1) || 1
      var win = url ? ' onclick="popup(\''+url+'\'); return false;"' : ''
      var tag = '<span class="'+typ+'" title="'+tip+'"'+win+'>'+str+'</span>'
      tag = pre ? pre + ' ' + tag : tag
      rem.replaceWith(rem.text().replace(rep, tag))
    })
  })
  var sim = $('h2').map(function() {
    return similarity($(this).nextUntil('h2').find('.comment:not(:contains("(Excluded)"))').get().map(i => $(i).text()))
  }).get()
  types['similarity'] = Math.round(arrayAverage(sim)) + "%"
  summary(types)
}

function similarity(comments) {
  if (comments.length) {
    var arr = comments.map(countWords)
    var results = []
    for (var i = 0; i < arr.length - 1; i++) {
      for (var j = i + 1; j < arr.length; j++) {
        results.push(commonWords(arr[i], arr[j]) / maxTotal(arr[i], arr[j]))
      }
    }
    return arrayAverage(results) * 100
  }
}

const countWords = str => str.match(/\w+/g).reduce((a, word) => {
  a[word] = (a[word] || 0) + 1
  return a
}, {})

const commonWords = (a, b) => Object.keys(a).filter({}.hasOwnProperty.bind(b)).reduce((acc, word) =>
  (a[word] > b[word]) ? acc + b[word] : acc + a[word], 0)

const maxTotal = (a, b) => Math.max(sumValues(a), sumValues(b))

const sumValues = obj => Object.values(obj).reduce((a, b) => a + b)

const arrayAverage = arr => arr.reduce((a, b) => a + b) / arr.length

var find = 0

function summary(types) {
  var sum = ''
  $.each(types, function(key, val) {
    sum += '<span class="'+key+'">'+val+' '+key+'</span> '
  })
  $('.button').html(sum).click(function() {
    var span = $('.comment span')
    span.removeClass('focus')
    span.eq(find).addClass('focus')
    $(document.body).animate({
        scrollTop: span.eq(find).offset().top - $(window).height()/2
    }, 500)
    find = (find >= span.length - 1) ? 0 : find + 1
  })
}

function popup(url) {
  window.open(url+"&theme=tinymce", "Tip", "width=480,height=380,menubar=no,location=no,resizable=no,status=no")
}

function button() {
  $('<div>').addClass('button').text('Check')
    .click(function() {
      $(this).off()
      $(this).text('Checking...')
      check('.comment').done(mark)
  }).appendTo('body')
}

$(document).ready(button)