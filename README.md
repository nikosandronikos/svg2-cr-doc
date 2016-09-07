# svg2-cr-doc
Tool to generate Disposition of Comments for SVG 2 from Github issues.

View the generated file at https://nikosandronikos.github.io/svg2-cr-doc

Looks for the following labels in SVG WG issue tracker to compile the list
* DoC_approved
* DoC_rejected

Then uses the following labels to further refine the displayed state:
* DoC_positiveResponse
* DoC_noResponse
* DoC_negativeResponse

