<?php

namespace PresentationBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;

class IndexController extends Controller
{
    /**
     * @Route("/")
     * @Template("PresentationBundle:index:index.html.twig")
     */
    public function indexAction()
    {
        return array(
            "pageName" => "index",
        );
    }

    /**
     * @Route("/game")
     * @Template("PresentationBundle:index:game.html.twig")
     */
    public function gameAction()
    {
        $gameList = $this->getDoctrine()->getManager()->getRepository('GameBundle:Game')->findAll();
        return array(
            "pageName" => "game",
            "gameList" => $gameList,
        );
    }
}


