#source: https://stat.ethz.ch/pipermail/r-help/2004-June/053343.html
#source2: http://stackoverflow.com/questions/1826519/how-to-assign-from-a-function-which-returns-more-than-one-value

# Assign to multiple values at time
list <- structure(NA,class="result")
"[<-.result" <- function(x,...,value) {
  args <- as.list(match.call())
  args <- args[-c(1:2,length(args))]
  length(value) <- length(args)
  for(i in seq(along=args)) {
    a <- args[[i]]
    if(!missing(a)) eval.parent(substitute(a <- v,list(a=a,v=value[[i]])))
  }
  x
}
