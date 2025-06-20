let registerSelect = (jquery) => {};

const groupHTMLTemplate = `<div class="group">
  <label>{0}</label>
  <div class="contains">
    {1}
  </div>
</div>`

const optionHTMLTemplate = `<label class="option" value="{0}">{1}</label>`

export default function() {
  registerSelect = (jquery) => {
    const select = $(jquery);
    const label = $(jquery + " > label");
    const options = $(jquery + " .option");

    select
      .off('click')
      .on('click', () => {
        select.attr('data-active', select.attr('data-active') == "true" ? "false" : "true")
      })

    options
      .off('click')
      .on('click', (e) => {
        select.attr('value', $(e.target).attr('value'));
        label.text(e.target.innerHTML);
      })
    
    select.attr('value', $(options[0]).attr('value'));
    label.text(options[0].innerHTML);
  }

  $('.multilayered-select').each((index, element) => {
    console.log(element)
    
    if (!element.id) return;
    
    registerSelect('#'+element.id);
  })
}

export { groupHTMLTemplate, optionHTMLTemplate, registerSelect }