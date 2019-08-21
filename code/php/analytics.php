<?php
  $config = include("/var/www/html/code/php/GA_config.php");
  if(isset($config["Google-Analytics-gtag-toekn"])){
?>
<!-- Global site tag (gtag.js) - Google Analytics -->

<script async src="https://www.googletagmanager.com/gtag/js?id=<?php echo $config["Google-Analytics-gtag-toekn"]; ?>" ></script>

<script>

  window.dataLayer = window.dataLayer || [];

  function gtag(){dataLayer.push(arguments);}

  gtag('js', new Date());

 

  gtag('config', '<?php echo $config["Google-Analytics-gtag-toekn"]; ?>');

</script>
<?php
  }
?>
