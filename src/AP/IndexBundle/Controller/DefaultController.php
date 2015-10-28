<?php

namespace AP\IndexBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class DefaultController extends Controller
{
    public function indexAction($name)
    {
        return $this->render('APIndexBundle:Default:index.html.twig', array('name' => $name));
    }
}
